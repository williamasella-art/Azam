import WidgetKit
import SwiftUI

// Data written by the app through ExtensionStorage (JSON under key "widget").
struct Prayer: Decodable { let name: String; let time: String }
struct Verse: Decodable { let teksArab: String; let teksIndonesia: String; let surah: String; let nomorAyat: Int }
struct WidgetData: Decodable {
    let city: String; let timezone: String; let prayers: [Prayer]; let verse: Verse?
}

let appGroup = "group.com.emergent.qurandaily.fst79v"

func loadData() -> WidgetData? {
    guard let raw = UserDefaults(suiteName: appGroup)?.string(forKey: "widget"),
          let bytes = raw.data(using: .utf8) else { return nil }
    return try? JSONDecoder().decode(WidgetData.self, from: bytes)
}

struct NextPrayer { let name: String; let date: Date; let tomorrow: Bool }

func nextPrayer(_ data: WidgetData, at now: Date) -> NextPrayer? {
    let zone = TimeZone(identifier: data.timezone) ?? TimeZone.current
    var calendar = Calendar(identifier: .gregorian); calendar.timeZone = zone
    let start = calendar.startOfDay(for: now)
    func date(for time: String, dayOffset: Int) -> Date? {
        let parts = time.split(separator: ":").compactMap { Int($0) }
        guard parts.count == 2, let day = calendar.date(byAdding: .day, value: dayOffset, to: start) else { return nil }
        return calendar.date(bySettingHour: parts[0], minute: parts[1], second: 0, of: day)
    }
    for prayer in data.prayers { if let d = date(for: prayer.time, dayOffset: 0), d > now { return NextPrayer(name: prayer.name, date: d, tomorrow: false) } }
    if let first = data.prayers.first, let d = date(for: first.time, dayOffset: 1) { return NextPrayer(name: first.name, date: d, tomorrow: true) }
    return nil
}

struct AzamEntry: TimelineEntry { let date: Date; let data: WidgetData?; let next: NextPrayer? }

struct AzamProvider: TimelineProvider {
    func placeholder(in context: Context) -> AzamEntry { AzamEntry(date: Date(), data: nil, next: nil) }
    func getSnapshot(in context: Context, completion: @escaping (AzamEntry) -> Void) {
        let data = loadData(); let now = Date()
        completion(AzamEntry(date: now, data: data, next: data.flatMap { nextPrayer($0, at: now) }))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<AzamEntry>) -> Void) {
        let data = loadData(); var entries: [AzamEntry] = []; var cursor = Date()
        // Refresh right after each prayer passes, so the "next" prayer is always accurate.
        for _ in 0..<6 {
            let next = data.flatMap { nextPrayer($0, at: cursor) }
            entries.append(AzamEntry(date: cursor, data: data, next: next))
            guard let n = next else { break }
            cursor = n.date.addingTimeInterval(60)
        }
        completion(Timeline(entries: entries, policy: .atEnd))
    }
}

struct AzanView: View {
    @Environment(\.widgetFamily) var family
    let entry: AzamEntry
    var body: some View {
        switch family {
        case .accessoryInline:
            if let n = entry.next { Text("\(n.name) \(n.date, style: .time) · \(n.date, style: .relative)") } else { Text("Azam · buka untuk jadwal") }
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 2) {
                Text(entry.next.map { "SALAT BERIKUTNYA\($0.tomorrow ? " · BESOK" : "")" } ?? "AZAM").font(.caption2).fontWeight(.bold)
                if let n = entry.next {
                    HStack(alignment: .firstTextBaseline, spacing: 6) { Text(n.name).font(.headline); Text(n.date, style: .time).font(.headline) }
                    Text(n.date, style: .relative).font(.caption)
                } else { Text("Buka Azam sekali untuk memuat jadwal.").font(.caption) }
            }
        default:
            VStack(alignment: .leading, spacing: 6) {
                Text(entry.next.map { "SALAT BERIKUTNYA\($0.tomorrow ? " · BESOK" : "")" } ?? "AZAM").font(.caption2).fontWeight(.bold).foregroundColor(Color("azamSkyLight"))
                if let n = entry.next {
                    Text(n.name).font(.headline).foregroundColor(.white)
                    Text(n.date, style: .time).font(.system(size: 34, weight: .heavy)).foregroundColor(.white)
                    Text(n.date, style: .relative).font(.caption).fontWeight(.semibold).foregroundColor(Color("azamGold"))
                } else { Text("Buka Azam sekali untuk memuat jadwal salat.").font(.caption).foregroundColor(.white) }
                Spacer(minLength: 0)
                Text(entry.data?.city ?? "Azam").font(.caption2).foregroundColor(Color("azamSkyLight"))
            }
            .padding(14).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .containerBackground(for: .widget) { LinearGradient(colors: [Color("azamSky"), Color("azamNavy")], startPoint: .top, endPoint: .bottom) }
        }
    }
}

struct AyatView: View {
    @Environment(\.widgetFamily) var family
    let entry: AzamEntry
    var body: some View {
        let verse = entry.data?.verse
        switch family {
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 2) {
                Text(verse.map { "QS. \($0.surah) : \($0.nomorAyat)" } ?? "SEAYAT · AZAM").font(.caption2).fontWeight(.bold)
                Text(verse?.teksIndonesia ?? "Buka Azam untuk memuat ayat hari ini.").font(.caption2).lineLimit(3)
            }
        default:
            VStack(alignment: .leading, spacing: 6) {
                HStack { Text("SEAYAT HARI INI").font(.caption2).fontWeight(.bold).foregroundColor(Color("azamSkyLight")); Spacer(); Text(verse.map { "QS. \($0.surah) : \($0.nomorAyat)" } ?? "").font(.caption2).foregroundColor(Color("azamGold")) }
                Text(verse?.teksArab ?? "").font(.title3).multilineTextAlignment(.trailing).frame(maxWidth: .infinity, alignment: .trailing).lineLimit(2).foregroundColor(.white)
                Text(verse.map { "“\($0.teksIndonesia)”" } ?? "Buka Azam sekali untuk memuat ayat hari ini.").font(.caption).lineLimit(3).foregroundColor(.white.opacity(0.85))
                Spacer(minLength: 0)
            }
            .padding(14).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .containerBackground(for: .widget) { Color("azamNavy") }
        }
    }
}

struct AzanWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "AzamAzan", provider: AzamProvider()) { AzanView(entry: $0) }
            .configurationDisplayName("Hitung mundur azan")
            .description("Salat berikutnya dan sisa waktunya.")
            .supportedFamilies([.systemSmall, .systemMedium, .accessoryInline, .accessoryRectangular])
    }
}

struct AyatWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "AzamAyat", provider: AzamProvider()) { AyatView(entry: $0) }
            .configurationDisplayName("Seayat hari ini")
            .description("Ayat harian dengan terjemahan Indonesia.")
            .supportedFamilies([.systemMedium, .systemLarge, .accessoryRectangular])
    }
}

@main
struct AzamWidgetBundle: WidgetBundle {
    var body: some Widget { AzanWidget(); AyatWidget() }
}

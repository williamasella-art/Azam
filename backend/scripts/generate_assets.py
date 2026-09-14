"""One-off asset generator for Azam UI illustrations (Gemini Nano Banana)."""
import asyncio
import base64
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv(Path(__file__).resolve().parents[1] / '.env')
OUT = Path('/app/frontend/assets/images/gen')
OUT.mkdir(parents=True, exist_ok=True)
STYLE = ('Flat modern vector illustration, smooth gradients, soft rounded shapes, playful Gen-Z app aesthetic, '
         'color palette: light sky blue #7DD3FC, sky blue #38BDF8, deep navy blue #0B2A4A, midnight blue #123F60, '
         'small white and warm gold accents. No text, no letters, no watermark, no typography. High quality, clean edges. ')
NAVY_BG = 'Solid flat deep navy background color #0B2A4A filling the whole canvas, no gradient on the background. '
ASSETS = {
    'logo': 'Mobile app icon, square with large rounded corners filling the canvas. A glowing white crescent moon embracing a small shield with a lock, on a vertical gradient from sky blue at top to deep navy at bottom, tiny sparkle stars. Centered, iconic, minimal.',
    'hero_birds': 'Wide horizontal scene: a serene mosque silhouette with domes and minarets at dusk, a flock of white birds flying across a gradient sky from light blue to deep navy, soft clouds, crescent moon and stars. Dreamy, calm, cinematic. Aspect ratio 16:9.',
    'cat_sleeping': NAVY_BG + 'A cute round chubby cat curled up sleeping peacefully on a soft cloud, tiny zzz bubbles, gentle smile, glowing light blue outline. Centered, kawaii style, soft shading.',
    'rain_window': NAVY_BG + 'A cozy window at night with rain droplets on the glass, soft glowing lamp, a small plant on the sill, light blue rain streaks. Centered, cozy, calm mood.',
    'badge_awan': NAVY_BG + 'A round glossy achievement medallion badge. Inside: a fluffy soft white and light-blue cloud icon, gold ring border, subtle sparkles, glowing. Centered, game reward style.',
    'badge_bintang': NAVY_BG + 'A round glossy achievement medallion badge. Inside: a bright shining golden five-point star with light blue glow, gold ring border, sparkles. Centered, game reward style.',
    'badge_purnama': NAVY_BG + 'A round glossy achievement medallion badge. Inside: a luminous full moon with soft craters, silver-white glow, gold ring border, tiny stars. Centered, game reward style.',
    'badge_syams': NAVY_BG + 'A round glossy achievement medallion badge. Inside: a radiant golden sun with rays, warm gold and sky-blue glow, ornate gold ring border, sparkles. Centered, premium game reward style.',
    'onboard_notif': 'A friendly smartphone floating in the sky with a glowing notification bell popping out with soft ripple waves, small white birds around, clouds, gradient background light blue to navy. Centered, cheerful.',
    'onboard_location': 'A cute location pin marker glowing above a small stylized city with a mosque, curved map roads, clouds and stars, gradient background light blue to navy. Centered, friendly.',
    'onboard_gender': 'Two friendly cartoon young Muslim characters standing side by side, a young man with a kufi cap and a young woman wearing a hijab, both smiling and waving, simple rounded shapes, gradient background light blue to navy. Centered, no text.',
    'onboard_creator': 'A warm greeting scene: a young friendly Muslim developer character sitting cross-legged with a laptop, waving hello, a cute cat beside him, a hovering heart bubble, gradient background light blue to navy. Centered.',
    'onboard_instagram': 'A smartphone showing a colorful generic social media photo feed with story circles, being overlaid by a glowing translucent navy lock screen with a crescent moon and a lock icon, floating locked app icons around (generic colored squares with padlocks). Gradient background light blue to navy. Centered, no text.',
    'onboard_timer': 'A soft glowing hourglass and an analog clock with a crescent moon, gentle countdown ripples, calm birds, gradient background light blue to navy. Centered, friendly.',
    'kaaba': NAVY_BG + 'The Kaaba, a black cube with a golden band, viewed straight from the front slightly above, glowing light blue aura around it, tiny sparkles. Centered, iconic, clean.',
    'hajj': 'Pilgrims in white ihram clothing walking peacefully around the Kaaba under a starry navy sky with a crescent moon, warm golden lights, soft clouds, gradient background light blue to navy. Wide 16:9 scene, calm and hopeful.',
    'share_bg': 'Vertical 9:16 social-story background: gradient from light sky blue at top to deep navy at bottom, a mosque silhouette at the bottom edge, white birds, floating soft clouds, glowing stars and a crescent moon, lots of empty space in the middle. No text.',
    'welcome_hero': 'A young Muslim person sitting calmly in prayer pose on a cloud with a smartphone put aside face-down, birds and a cat nearby, crescent moon, gradient background light blue to navy. Centered, peaceful, vertical composition.',
}


async def generate(name: str, prompt: str) -> None:
    target = OUT / f'{name}.png'
    if target.exists():
        print('skip', name)
        return
    chat = LlmChat(api_key=os.getenv('EMERGENT_LLM_KEY'), session_id=f'azam-asset-{name}', system_message='You are an illustrator.')
    chat.with_model('gemini', 'gemini-3.1-flash-image-preview').with_params(modalities=['image', 'text'])
    for attempt in range(3):
        try:
            _text, images = await chat.send_message_multimodal_response(UserMessage(text=STYLE + prompt))
            if images:
                target.write_bytes(base64.b64decode(images[0]['data']))
                print('ok', name, target.stat().st_size)
                return
            print('no image', name)
        except Exception as exc:  # noqa: BLE001
            print('error', name, attempt, str(exc)[:160])
            await asyncio.sleep(3)


async def main() -> None:
    names = sys.argv[1:] or list(ASSETS)
    for name in names:
        await generate(name, ASSETS[name])


if __name__ == '__main__':
    asyncio.run(main())

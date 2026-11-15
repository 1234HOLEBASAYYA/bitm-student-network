import os
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
import imageio
import cv2

WIDTH = 1280
HEIGHT = 720
FPS = 30

# Load fonts
FONT_HEAD_LG = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 44)
FONT_HEAD_MD = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 32)
FONT_HEAD_SM = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 24)
FONT_TEXT_MD = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 20)
FONT_TEXT_SM = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 16)
FONT_TAG = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 14)

def create_gradient_bg(w, h, color1=(30, 58, 138), color2=(15, 23, 42)):
    base = np.zeros((h, w, 3), dtype=np.uint8)
    for y in range(h):
        ratio = y / h
        r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
        g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
        b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
        base[y, :] = [r, g, b]
    return Image.fromarray(base)

def fit_and_zoom_image(img, target_w, target_h, zoom=1.0, pan_x=0.5, pan_y=0.5):
    # Scale image to cover target_w * zoom, target_h * zoom
    img_ratio = img.width / img.height
    target_ratio = target_w / target_h

    current_w = target_w * zoom
    current_h = target_h * zoom

    if img_ratio > target_ratio:
        new_h = int(current_h)
        new_w = int(new_h * img_ratio)
    else:
        new_w = int(current_w)
        new_h = int(new_w / img_ratio)

    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Crop
    left = int((new_w - target_w) * pan_x)
    top = int((new_h - target_h) * pan_y)
    right = left + target_w
    bottom = top + target_h
    return resized.crop((left, top, right, bottom))

def draw_rounded_card(overlay_draw, x1, y1, x2, y2, radius, fill_color, border_color=None):
    overlay_draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, fill=fill_color, outline=border_color, width=1)

def add_watermark(frame_img, logo):
    # Top-left watermark banner
    overlay = Image.new('RGBA', frame_img.size, (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    
    # Soft background pill for watermark
    draw_rounded_card(odraw, 36, 28, 480, 84, 12, (15, 23, 42, 200), (226, 232, 240, 60))
    
    # Paste resized logo
    logo_thumb = logo.copy().resize((48, 48), Image.Resampling.LANCZOS)
    overlay.paste(logo_thumb, (48, 32), logo_thumb if logo_thumb.mode == 'RGBA' else None)
    
    # Text
    odraw.text((108, 36), "BALLARI INSTITUTE OF TECHNOLOGY & MANAGEMENT", font=FONT_TAG, fill=(255, 255, 255))
    odraw.text((108, 54), "Jnana Gangotri Campus • Student Network", font=FONT_TEXT_SM, fill=(148, 163, 184))
    
    return Image.alpha_composite(frame_img.convert('RGBA'), overlay)

def add_lower_third(frame_img, category, title, description, progress_pct=0.0):
    overlay = Image.new('RGBA', frame_img.size, (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)

    # Glassmorphism lower-third card
    card_x1 = 50
    card_y1 = 520
    card_x2 = 1230
    card_y2 = 670

    draw_rounded_card(odraw, card_x1, card_y1, card_x2, card_y2, 16, (15, 23, 42, 215), (255, 255, 255, 40))

    # Category Pill
    pill_w = 190
    draw_rounded_card(odraw, card_x1 + 24, card_y1 + 18, card_x1 + 24 + pill_w, card_y1 + 46, 8, (30, 58, 138, 240), (191, 219, 254, 180))
    odraw.text((card_x1 + 36, card_y1 + 23), category, font=FONT_TAG, fill=(219, 234, 254))

    # Title
    odraw.text((card_x1 + 24, card_y1 + 54), title, font=FONT_HEAD_SM, fill=(255, 255, 255))

    # Description
    odraw.text((card_x1 + 24, card_y1 + 92), description, font=FONT_TEXT_MD, fill=(226, 232, 240))

    # Progress line at bottom of lower third
    prog_w = int((card_x2 - card_x1 - 48) * progress_pct)
    if prog_w > 0:
        odraw.rectangle([card_x1 + 24, card_y2 - 8, card_x1 + 24 + prog_w, card_y2 - 5], fill=(37, 99, 235, 255))

    return Image.alpha_composite(frame_img, overlay).convert('RGB')

def render_intro_frame(t, logo):
    # t from 0.0 to 1.0 (75 frames, 2.5s)
    bg = create_gradient_bg(WIDTH, HEIGHT, (30, 58, 138), (15, 23, 42))
    overlay = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Fade in
    alpha = min(255, int(t * 3 * 255))

    # Centered Logo
    logo_w, logo_h = 130, 130
    logo_scaled = logo.copy().resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    overlay.paste(logo_scaled, ((WIDTH - logo_w) // 2, 120), logo_scaled if logo_scaled.mode == 'RGBA' else None)

    # Title
    t1 = "BALLARI INSTITUTE OF TECHNOLOGY & MANAGEMENT"
    t2 = "Jnana Gangotri Campus, Ballari • Estd. 1997 • NAAC 'A+'"
    t3 = "BITM STUDENT NETWORK"
    t4 = "Connect. Collaborate. Learn. Grow Together."

    draw.text(((WIDTH - draw.textlength(t1, font=FONT_TAG)) // 2, 275), t1, font=FONT_TAG, fill=(191, 219, 254, alpha))
    draw.text(((WIDTH - draw.textlength(t2, font=FONT_TEXT_SM)) // 2, 305), t2, font=FONT_TEXT_SM, fill=(148, 163, 184, alpha))

    # Big headline badge
    draw_rounded_card(draw, 260, 360, 1020, 460, 20, (30, 58, 138, min(240, alpha)), (255, 255, 255, 80))
    draw.text(((WIDTH - draw.textlength(t3, font=FONT_HEAD_LG)) // 2, 385), t3, font=FONT_HEAD_LG, fill=(255, 255, 255, alpha))

    # Subtitle
    draw.text(((WIDTH - draw.textlength(t4, font=FONT_HEAD_SM)) // 2, 495), t4, font=FONT_HEAD_SM, fill=(219, 234, 254, alpha))

    # Bottom pill
    btm_text = "CAMPUS TOUR & PLATFORM INTRODUCTION"
    draw_rounded_card(draw, 420, 560, 860, 600, 20, (15, 23, 42, 200), (255, 255, 255, 50))
    draw.text(((WIDTH - draw.textlength(btm_text, font=FONT_TAG)) // 2, 572), btm_text, font=FONT_TAG, fill=(148, 163, 184, alpha))

    return Image.alpha_composite(bg.convert('RGBA'), overlay).convert('RGB')

def render_outro_frame(t, logo):
    # t from 0.0 to 1.0 (90 frames, 3.0s)
    bg = create_gradient_bg(WIDTH, HEIGHT, (15, 23, 42), (30, 58, 138))
    overlay = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    alpha = min(255, int(min(t * 3, 1.0) * 255))

    logo_w, logo_h = 120, 120
    logo_scaled = logo.copy().resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    overlay.paste(logo_scaled, ((WIDTH - logo_w) // 2, 110), logo_scaled if logo_scaled.mode == 'RGBA' else None)

    t1 = "WELCOME TO THE FUTURE OF CAMPUS COLLABORATION"
    t2 = "BITM STUDENT NETWORK"
    t3 = "Connect with Peers • Share Projects • Prepare for Placements • Explore Events"
    t4 = "JOIN OVER 1,200+ VERIFIED BITM STUDENTS"

    draw.text(((WIDTH - draw.textlength(t1, font=FONT_TAG)) // 2, 255), t1, font=FONT_TAG, fill=(191, 219, 254, alpha))
    draw.text(((WIDTH - draw.textlength(t2, font=FONT_HEAD_LG)) // 2, 290), t2, font=FONT_HEAD_LG, fill=(255, 255, 255, alpha))
    draw.text(((WIDTH - draw.textlength(t3, font=FONT_TEXT_MD)) // 2, 365), t3, font=FONT_TEXT_MD, fill=(226, 232, 240, alpha))

    # CTA Button
    btn_w = 540
    btn_x = (WIDTH - btn_w) // 2
    draw_rounded_card(draw, btn_x, 430, btn_x + btn_w, 495, 14, (37, 99, 235, alpha), (255, 255, 255, 120))
    draw.text(((WIDTH - draw.textlength(t4, font=FONT_HEAD_SM)) // 2, 448), t4, font=FONT_HEAD_SM, fill=(255, 255, 255, alpha))

    # Info footer
    foot1 = "Ballari Institute of Technology & Management (BITM)"
    foot2 = "Hospet Road, Ballari - 583104 • www.bitm.edu.in"
    draw.text(((WIDTH - draw.textlength(foot1, font=FONT_TEXT_SM)) // 2, 555), foot1, font=FONT_TEXT_SM, fill=(148, 163, 184, alpha))
    draw.text(((WIDTH - draw.textlength(foot2, font=FONT_TAG)) // 2, 585), foot2, font=FONT_TAG, fill=(100, 116, 139, alpha))

    return Image.alpha_composite(bg.convert('RGBA'), overlay).convert('RGB')

def main():
    print("Initializing Official Video Generation for BITM Student Network...")

    # Load source images
    logo = Image.open('client/src/assets/images/bitm-logo.png').convert('RGBA')
    img_admin = Image.open('client/src/assets/images/bitm-admin-block.jpg').convert('RGB')
    img_theatre = Image.open('client/src/assets/images/bitm-campus-theatre.jpg').convert('RGB')
    img_labs = Image.open('client/src/assets/images/bitm-innovation-lab.jpg').convert('RGB')
    img_auditorium = Image.open('client/src/assets/images/bitm-auditorium.jpg').convert('RGB')

    scenes = [
        {
            'type': 'intro',
            'duration': 75, # 2.5 sec
        },
        {
            'type': 'photo',
            'image': img_admin,
            'duration': 105, # 3.5 sec
            'category': 'CAMPUS INFRASTRUCTURE • 01',
            'title': 'Administrative & PG Engineering Block',
            'desc': 'Jnana Gangotri Campus — Housing 8 VTU Engineering Departments & Research Centers.',
            'zoom_start': 1.0,
            'zoom_end': 1.06,
            'pan_x': 0.5,
            'pan_y': 0.4
        },
        {
            'type': 'photo',
            'image': img_theatre,
            'duration': 105, # 3.5 sec
            'category': 'STUDENT LIFE & CULTURE • 02',
            'title': 'BITM Open Air Theatre & Cultural Center',
            'desc': 'Vibrant hub for annual flagship fests, technical clubs, hackathons, and student assemblies.',
            'zoom_start': 1.05,
            'zoom_end': 1.0,
            'pan_x': 0.5,
            'pan_y': 0.6
        },
        {
            'type': 'photo',
            'image': img_labs,
            'duration': 110, # 3.6 sec
            'category': 'ACADEMIC COLLABORATION • 03',
            'title': 'Smart Collaborative Classrooms & Innovation Labs',
            'desc': 'Where students and faculty innovate across AI, Cloud, Embedded Systems, and Web Tech.',
            'zoom_start': 1.0,
            'zoom_end': 1.05,
            'pan_x': 0.45,
            'pan_y': 0.5
        },
        {
            'type': 'photo',
            'image': img_auditorium,
            'duration': 110, # 3.6 sec
            'category': 'CAREERS & ACHIEVEMENTS • 04',
            'title': 'Central Grand Auditorium',
            'desc': 'Venue for campus recruitment drives, national technical symposiums, and BITM INVENTO.',
            'zoom_start': 1.05,
            'zoom_end': 1.0,
            'pan_x': 0.5,
            'pan_y': 0.5
        },
        {
            'type': 'outro',
            'duration': 90, # 3.0 sec
        }
    ]

    # Pre-render raw frames for each scene
    all_scene_frames = []

    for s_idx, scene in enumerate(scenes):
        count = scene['duration']
        s_frames = []
        stype = scene['type']

        for f_idx in range(count):
            t = f_idx / (count - 1) if count > 1 else 0

            if stype == 'intro':
                frame = render_intro_frame(t, logo)
            elif stype == 'outro':
                frame = render_outro_frame(t, logo)
            else:
                zoom = scene['zoom_start'] + (scene['zoom_end'] - scene['zoom_start']) * t
                cropped = fit_and_zoom_image(scene['image'], WIDTH, HEIGHT, zoom=zoom, pan_x=scene['pan_x'], pan_y=scene['pan_y'])
                with_wm = add_watermark(cropped, logo)
                frame = add_lower_third(with_wm, scene['category'], scene['title'], scene['desc'], progress_pct=t)

            s_frames.append(frame)

        all_scene_frames.append(s_frames)

    # Assemble scenes with cross-dissolve transitions
    TRANSITION_FRAMES = 15 # 0.5 sec blend
    final_frames = []

    for idx, s_frames in enumerate(all_scene_frames):
        if idx == 0:
            # First scene
            final_frames.extend(s_frames[:-TRANSITION_FRAMES])
        else:
            # Cross-fade previous tail with current head
            prev_tail = all_scene_frames[idx - 1][-TRANSITION_FRAMES:]
            curr_head = s_frames[:TRANSITION_FRAMES]

            for i in range(TRANSITION_FRAMES):
                blend_ratio = i / (TRANSITION_FRAMES - 1)
                blended = Image.blend(prev_tail[i], curr_head[i], blend_ratio)
                final_frames.append(blended)

            # Append the rest of this scene
            if idx < len(all_scene_frames) - 1:
                final_frames.extend(s_frames[TRANSITION_FRAMES:-TRANSITION_FRAMES])
            else:
                # Final scene includes its tail
                final_frames.extend(s_frames[TRANSITION_FRAMES:])

    print(f"Total compiled frames: {len(final_frames)} (~{len(final_frames) / FPS:.1f}s)")

    output_path = 'client/public/videos/bitm-intro.mp4'
    assets_path = 'client/src/assets/videos/bitm-intro.mp4'

    os.makedirs('client/public/videos', exist_ok=True)
    os.makedirs('client/src/assets/videos', exist_ok=True)

    print("Encoding video with OpenCV VideoWriter (MP4)...")
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, FPS, (WIDTH, HEIGHT))

    for f in final_frames:
        bgr = cv2.cvtColor(np.array(f), cv2.COLOR_RGB2BGR)
        out.write(bgr)

    out.release()

    # Duplicate to src/assets/videos
    shutil.copyfile(output_path, assets_path)

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Video generated successfully!")
    print(f"Saved to: {output_path} ({size_mb:.2f} MB)")
    print(f"Saved to: {assets_path}")

if __name__ == '__main__':
    main()

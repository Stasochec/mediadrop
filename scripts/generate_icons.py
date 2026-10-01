import math
from pathlib import Path
from PIL import Image, ImageDraw

def create_icon(size: int, output_path: Path):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Scale factor
    s = size / 512.0

    # Draw rounded background
    bg_radius = int(120 * s)
    # Background gradient approximation with rounded rectangle
    draw.rounded_rectangle([int(8*s), int(8*s), size - int(8*s), size - int(8*s)], radius=bg_radius, fill=(15, 23, 42, 255), outline=(99, 102, 241, 160), width=max(1, int(4*s)))

    # Draw stylish inner circle / accent
    center = (size // 2, size // 2)
    inner_r = int(170 * s)
    draw.ellipse([center[0] - inner_r, center[1] - inner_r, center[0] + inner_r, center[1] + inner_r], outline=(30, 41, 59, 255), width=max(1, int(6*s)))

    # Draw Downward Arrow & Tray
    arrow_w = max(4, int(28 * s))
    
    # Arrow line
    draw.line([(size//2, int(130*s)), (size//2, int(290*s))], fill=(6, 182, 212, 255), width=arrow_w)
    
    # Arrow head
    draw.line([(int(180*s), int(230*s)), (size//2, int(300*s))], fill=(6, 182, 212, 255), width=arrow_w)
    draw.line([(int(332*s), int(230*s)), (size//2, int(300*s))], fill=(6, 182, 212, 255), width=arrow_w)
    
    # Tray
    tray_y = int(350*s)
    draw.line([(int(140*s), int(330*s)), (int(140*s), tray_y), (int(372*s), tray_y), (int(372*s), int(330*s))], fill=(236, 72, 153, 255), width=arrow_w)

    img.save(output_path, "PNG")
    print(f"Generated {output_path} ({size}x{size})")

if __name__ == "__main__":
    public_dir = Path(__file__).resolve().parent.parent / "frontend" / "public"
    create_icon(192, public_dir / "icons" / "icon-192.png")
    create_icon(512, public_dir / "icons" / "icon-512.png")
    create_icon(180, public_dir / "apple-touch-icon.png")

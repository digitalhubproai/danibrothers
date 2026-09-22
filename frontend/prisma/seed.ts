import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import bcrypt from "bcryptjs"
import { resolveDatabaseUrl } from "../lib/db-url"
import { imagesForProduct } from "./product-images"

const adapter = new PrismaBetterSqlite3({ url: resolveDatabaseUrl() })
const prisma = new PrismaClient({ adapter })

type SeedProduct = {
  name: string
  brand: string
  category: string
  price: number
  compareAtPrice?: number
  stock: number
  condition: "NEW" | "REFURBISHED" | "USED"
  featured?: boolean
  description: string
  specs: { label: string; value: string }[]
}

const categories = [
  {
    name: "Laptops",
    slug: "laptops",
    icon: "laptop",
    sortOrder: 1,
    description: "Business ultrabooks, gaming rigs and everyday machines — new, refurbished and pre-owned.",
  },
  {
    name: "Desktops & PCs",
    slug: "desktops",
    icon: "pc-case",
    sortOrder: 2,
    description: "Custom builds, office towers and all-in-ones assembled and bench-tested in-house.",
  },
  {
    name: "Monitors",
    slug: "monitors",
    icon: "monitor",
    sortOrder: 3,
    description: "FHD to 4K panels for work, design and gaming, with warranty.",
  },
  {
    name: "Keyboards & Mice",
    slug: "keyboards-mice",
    icon: "keyboard",
    sortOrder: 4,
    description: "Mechanical and membrane keyboards, wired and wireless mice from trusted brands.",
  },
  {
    name: "Storage & Drives",
    slug: "storage",
    icon: "hard-drive",
    sortOrder: 5,
    description: "NVMe SSDs, hard drives, external disks and flash storage.",
  },
  {
    name: "Components",
    slug: "components",
    icon: "cpu",
    sortOrder: 6,
    description: "RAM, graphics cards, power supplies and everything for an upgrade or a fresh build.",
  },
  {
    name: "Audio & Webcams",
    slug: "audio-webcams",
    icon: "headphones",
    sortOrder: 7,
    description: "Headsets, speakers, microphones and webcams for calls, class and play.",
  },
  {
    name: "Accessories",
    slug: "accessories",
    icon: "cable",
    sortOrder: 8,
    description: "Bags, hubs, chargers, cables, cooling pads and the small things that matter.",
  },
  {
    name: "Security & CCTV",
    slug: "security-cctv",
    icon: "cctv",
    sortOrder: 9,
    description: "CCTV surveillance cameras, NVR kits and accessories for home and business security.",
  },
]

const products: SeedProduct[] = [
  // ── Laptops ───────────────────────────────────────────────────────────────
  {
    name: "MacBook Air 13\" M2 (2024)",
    brand: "Apple",
    category: "laptops",
    price: 264_999,
    compareAtPrice: 289_000,
    stock: 6,
    condition: "NEW",
    featured: true,
    description:
      "The M2 Air is still the laptop we hand to most people who ask for something thin, silent and genuinely all-day. 18-hour battery, a screen that holds up outdoors, and no fan to clog with Lahore dust.",
    specs: [
      { label: "Processor", value: "Apple M2, 8-core CPU" },
      { label: "Memory", value: "8GB unified" },
      { label: "Storage", value: "256GB SSD" },
      { label: "Display", value: "13.6\" Liquid Retina, 2560×1664" },
      { label: "Battery", value: "Up to 18 hours" },
      { label: "Weight", value: "1.24 kg" },
    ],
  },
  {
    name: "MacBook Pro 14\" M3 Pro",
    brand: "Apple",
    category: "laptops",
    price: 479_000,
    stock: 2,
    condition: "NEW",
    featured: true,
    description:
      "For editors and developers who actually push the machine. The Liquid Retina XDR display and ProMotion make timeline scrubbing feel immediate, and the port selection means one less dongle in your bag.",
    specs: [
      { label: "Processor", value: "Apple M3 Pro, 11-core CPU" },
      { label: "Memory", value: "18GB unified" },
      { label: "Storage", value: "512GB SSD" },
      { label: "Display", value: "14.2\" Liquid Retina XDR, 120Hz" },
      { label: "Ports", value: "3× Thunderbolt 4, HDMI, SDXC" },
      { label: "Weight", value: "1.55 kg" },
    ],
  },
  {
    name: "Dell Latitude 5420 Business Laptop",
    brand: "Dell",
    category: "laptops",
    price: 84_500,
    compareAtPrice: 96_000,
    stock: 11,
    condition: "REFURBISHED",
    featured: true,
    description:
      "Our best-selling refurbished business machine. Ex-corporate stock, fully serviced with a new battery where needed, and a keyboard that survives years of typing. Six-month shop warranty.",
    specs: [
      { label: "Processor", value: "Intel Core i5-1135G7, 11th Gen" },
      { label: "Memory", value: "8GB DDR4" },
      { label: "Storage", value: "256GB NVMe SSD" },
      { label: "Display", value: "14\" FHD IPS" },
      { label: "Condition", value: "Grade A refurbished" },
      { label: "Warranty", value: "6 months shop warranty" },
    ],
  },
  {
    name: "Dell XPS 13 Plus 9320",
    brand: "Dell",
    category: "laptops",
    price: 319_000,
    stock: 3,
    condition: "NEW",
    description:
      "Dell's most striking ultrabook — edge-to-edge keyboard, invisible trackpad, and a 13.4\" OLED that makes spreadsheets look like a design object. Runs warm under sustained load, so it suits office work over rendering.",
    specs: [
      { label: "Processor", value: "Intel Core i7-1360P, 13th Gen" },
      { label: "Memory", value: "16GB LPDDR5" },
      { label: "Storage", value: "512GB NVMe SSD" },
      { label: "Display", value: "13.4\" 3.5K OLED touch" },
      { label: "Weight", value: "1.26 kg" },
      { label: "Battery", value: "Up to 13 hours" },
    ],
  },
  {
    name: "HP EliteBook 840 G8",
    brand: "HP",
    category: "laptops",
    price: 134_900,
    compareAtPrice: 152_000,
    stock: 7,
    condition: "REFURBISHED",
    description:
      "The workhorse of a thousand offices. Magnesium body, excellent keyboard, and the Sure View privacy screen option for anyone working in a shared space. Ex-lease units in genuinely good shape.",
    specs: [
      { label: "Processor", value: "Intel Core i7-1165G7, 11th Gen" },
      { label: "Memory", value: "16GB DDR4" },
      { label: "Storage", value: "512GB NVMe SSD" },
      { label: "Display", value: "14\" FHD IPS" },
      { label: "Condition", value: "Grade A refurbished" },
      { label: "Warranty", value: "6 months shop warranty" },
    ],
  },
  {
    name: "HP Pavilion 15 Gaming Laptop",
    brand: "HP",
    category: "laptops",
    price: 164_500,
    stock: 5,
    condition: "NEW",
    description:
      "An entry gaming and editing machine that doesn't look like one. RTX 3050 handles 1080p gaming and CUDA-accelerated exports comfortably. The 144Hz panel is the part you'll notice most.",
    specs: [
      { label: "Processor", value: "Intel Core i5-12500H, 12th Gen" },
      { label: "Graphics", value: "NVIDIA RTX 3050, 4GB" },
      { label: "Memory", value: "16GB DDR4" },
      { label: "Storage", value: "512GB NVMe SSD" },
      { label: "Display", value: "15.6\" FHD 144Hz" },
      { label: "Weight", value: "2.29 kg" },
    ],
  },
  {
    name: "Lenovo ThinkPad T14 Gen 3",
    brand: "Lenovo",
    category: "laptops",
    price: 119_500,
    stock: 9,
    condition: "REFURBISHED",
    featured: true,
    description:
      "If you type for a living, this is the keyboard to beat. Mil-spec tested, easy to service, and parts are available everywhere in Pakistan — which is why we keep buying them back.",
    specs: [
      { label: "Processor", value: "Intel Core i5-1235U, 12th Gen" },
      { label: "Memory", value: "16GB DDR4" },
      { label: "Storage", value: "512GB NVMe SSD" },
      { label: "Display", value: "14\" FHD IPS, 300 nits" },
      { label: "Condition", value: "Grade A refurbished" },
      { label: "Warranty", value: "6 months shop warranty" },
    ],
  },
  {
    name: "Lenovo IdeaPad Slim 3",
    brand: "Lenovo",
    category: "laptops",
    price: 114_999,
    compareAtPrice: 128_000,
    stock: 14,
    condition: "NEW",
    description:
      "The sensible student laptop. Light enough to carry to class, cheap enough to not panic about, and the 15.6\" screen is comfortable for long assignments.",
    specs: [
      { label: "Processor", value: "AMD Ryzen 5 7530U" },
      { label: "Memory", value: "8GB DDR4" },
      { label: "Storage", value: "512GB NVMe SSD" },
      { label: "Display", value: "15.6\" FHD" },
      { label: "Battery", value: "Up to 10 hours" },
      { label: "Weight", value: "1.62 kg" },
    ],
  },
  {
    name: "Asus Vivobook 15 OLED",
    brand: "Asus",
    category: "laptops",
    price: 154_999,
    stock: 8,
    condition: "NEW",
    description:
      "You are not going to find a better screen at this price. The OLED panel is colour-accurate enough for photo work, and the chassis stays reasonably cool for a thin 15-inch.",
    specs: [
      { label: "Processor", value: "Intel Core i5-13500H, 13th Gen" },
      { label: "Memory", value: "16GB DDR4" },
      { label: "Storage", value: "512GB NVMe SSD" },
      { label: "Display", value: "15.6\" FHD OLED, 600 nits" },
      { label: "Weight", value: "1.7 kg" },
      { label: "Ports", value: "USB-C, 3× USB-A, HDMI 1.4" },
    ],
  },
  {
    name: "Acer Aspire 5 Slim",
    brand: "Acer",
    category: "laptops",
    price: 124_500,
    stock: 10,
    condition: "NEW",
    description:
      "Reliable, unexciting, and does everything an office needs. Easy to upgrade the RAM and storage yourself, which stretches it another few years.",
    specs: [
      { label: "Processor", value: "Intel Core i5-1235U, 12th Gen" },
      { label: "Memory", value: "8GB DDR4" },
      { label: "Storage", value: "512GB NVMe SSD" },
      { label: "Display", value: "15.6\" FHD IPS" },
      { label: "Upgradeable", value: "Yes — 2× SO-DIMM, 1× M.2" },
      { label: "Weight", value: "1.76 kg" },
    ],
  },
  {
    name: "MSI Katana 15 Gaming Laptop",
    brand: "MSI",
    category: "laptops",
    price: 244_999,
    compareAtPrice: 269_000,
    stock: 4,
    condition: "NEW",
    featured: true,
    description:
      "RTX 4060 in a 15-inch chassis that won't break your back. Handles current titles at 1080p high settings and doubles as a solid editing machine thanks to the NVENC encoder.",
    specs: [
      { label: "Processor", value: "Intel Core i7-13620H, 13th Gen" },
      { label: "Graphics", value: "NVIDIA RTX 4060, 8GB" },
      { label: "Memory", value: "16GB DDR5" },
      { label: "Storage", value: "1TB NVMe SSD" },
      { label: "Display", value: "15.6\" FHD 144Hz" },
      { label: "Weight", value: "2.25 kg" },
    ],
  },
  {
    name: "Dell Latitude 7490 (Pre-Owned)",
    brand: "Dell",
    category: "laptops",
    price: 52_000,
    compareAtPrice: 61_000,
    stock: 6,
    condition: "USED",
    description:
      "A genuinely cheap way into a decent laptop. These have cosmetic wear — light scratches on the lid, shiny keys — but the screen, hinges and battery are all checked. Fifteen-day check warranty.",
    specs: [
      { label: "Processor", value: "Intel Core i5-8350U, 8th Gen" },
      { label: "Memory", value: "8GB DDR4" },
      { label: "Storage", value: "256GB NVMe SSD" },
      { label: "Display", value: "14\" FHD" },
      { label: "Condition", value: "Pre-owned, cosmetic wear" },
      { label: "Warranty", value: "15-day check warranty" },
    ],
  },
  {
    name: "HP ProBook 450 G9",
    brand: "HP",
    category: "laptops",
    price: 108_000,
    stock: 8,
    condition: "REFURBISHED",
    description:
      "A 15.6-inch business machine with a full numeric keypad — the one people ask for when they do accounts work. Ex-lease, fully serviced.",
    specs: [
      { label: "Processor", value: "Intel Core i5-1235U, 12th Gen" },
      { label: "Memory", value: "8GB DDR4" },
      { label: "Storage", value: "256GB NVMe SSD" },
      { label: "Display", value: "15.6\" FHD" },
      { label: "Condition", value: "Grade A refurbished" },
      { label: "Warranty", value: "6 months shop warranty" },
    ],
  },

  // ── Desktops ──────────────────────────────────────────────────────────────
  {
    name: "Dani Brothers Value Desktop — i5 Build",
    brand: "Custom Build",
    category: "desktops",
    price: 96_500,
    stock: 5,
    condition: "NEW",
    featured: true,
    description:
      "Assembled and bench-tested in our shop. A clean, quiet office machine with room to grow — add a graphics card and a stick of RAM later without replacing anything.",
    specs: [
      { label: "Processor", value: "Intel Core i5-12400, 12th Gen" },
      { label: "Memory", value: "16GB DDR4 3200MHz" },
      { label: "Storage", value: "512GB NVMe SSD" },
      { label: "Motherboard", value: "B660M micro-ATX" },
      { label: "PSU", value: "550W 80+ Bronze" },
      { label: "Warranty", value: "1 year on parts" },
    ],
  },
  {
    name: "Gaming PC — Ryzen 5 + RTX 4060",
    brand: "Custom Build",
    category: "desktops",
    price: 289_000,
    compareAtPrice: 312_000,
    stock: 3,
    condition: "NEW",
    featured: true,
    description:
      "Our most-requested gaming build. Mesh-front case with four fans and a tower cooler, so it stays quiet under load. Every unit runs a 2-hour stress test before handover.",
    specs: [
      { label: "Processor", value: "AMD Ryzen 5 7600" },
      { label: "Graphics", value: "NVIDIA RTX 4060, 8GB" },
      { label: "Memory", value: "16GB DDR5 5600MHz" },
      { label: "Storage", value: "1TB NVMe Gen4 SSD" },
      { label: "PSU", value: "650W 80+ Bronze" },
      { label: "Warranty", value: "1 year on parts" },
    ],
  },
  {
    name: "Dell OptiPlex 3080 SFF (Refurbished)",
    brand: "Dell",
    category: "desktops",
    price: 58_500,
    compareAtPrice: 68_000,
    stock: 12,
    condition: "REFURBISHED",
    description:
      "Small form factor corporate desktops, ideal for a shop counter, clinic reception or school office. Small footprint, low power draw, and they run for years.",
    specs: [
      { label: "Processor", value: "Intel Core i5-10500, 10th Gen" },
      { label: "Memory", value: "8GB DDR4" },
      { label: "Storage", value: "256GB NVMe SSD" },
      { label: "Form factor", value: "Small form factor (SFF)" },
      { label: "Condition", value: "Grade A refurbished" },
      { label: "Warranty", value: "6 months shop warranty" },
    ],
  },
  {
    name: "HP EliteDesk 800 G6 Mini PC",
    brand: "HP",
    category: "desktops",
    price: 72_000,
    stock: 7,
    condition: "REFURBISHED",
    description:
      "Fits behind a monitor. Perfect where desk space is tight — we mount these on the VESA plate and you never see the machine at all.",
    specs: [
      { label: "Processor", value: "Intel Core i5-10500T, 10th Gen" },
      { label: "Memory", value: "16GB DDR4" },
      { label: "Storage", value: "512GB NVMe SSD" },
      { label: "Form factor", value: "Mini PC, VESA mountable" },
      { label: "Condition", value: "Grade A refurbished" },
      { label: "Warranty", value: "6 months shop warranty" },
    ],
  },
  {
    name: "Apple iMac 24\" M1",
    brand: "Apple",
    category: "desktops",
    price: 385_000,
    stock: 2,
    condition: "NEW",
    description:
      "An entire desktop in an 11.5mm slab. The 4.5K display alone justifies it if you work with colour — and the M1 is still faster than most people need.",
    specs: [
      { label: "Processor", value: "Apple M1, 8-core CPU" },
      { label: "Memory", value: "8GB unified" },
      { label: "Storage", value: "256GB SSD" },
      { label: "Display", value: "24\" 4.5K Retina, 4480×2520" },
      { label: "Ports", value: "2× Thunderbolt, 2× USB 3" },
      { label: "Weight", value: "4.48 kg" },
    ],
  },

  // ── Monitors ──────────────────────────────────────────────────────────────
  {
    name: "Dell UltraSharp U2723QE 27\" 4K",
    brand: "Dell",
    category: "monitors",
    price: 168_000,
    compareAtPrice: 185_000,
    stock: 4,
    condition: "NEW",
    featured: true,
    description:
      "The monitor we recommend for anyone doing serious work. Factory colour-calibrated, IPS Black panel for proper blacks, and a built-in USB-C hub that charges your laptop over one cable.",
    specs: [
      { label: "Size", value: "27 inch" },
      { label: "Resolution", value: "3840×2160 (4K)" },
      { label: "Panel", value: "IPS Black, 60Hz" },
      { label: "Colour", value: "98% DCI-P3, factory calibrated" },
      { label: "Ports", value: "USB-C 90W, DP, HDMI, RJ45" },
      { label: "Warranty", value: "3 years Dell warranty" },
    ],
  },
  {
    name: "Samsung Odyssey G5 27\" 1440p 165Hz",
    brand: "Samsung",
    category: "monitors",
    price: 92_500,
    stock: 6,
    condition: "NEW",
    featured: true,
    description:
      "The sweet spot for gaming: 1440p at 165Hz without the 4K price tag or the GPU requirement. Slight curve, which you stop noticing after a day.",
    specs: [
      { label: "Size", value: "27 inch" },
      { label: "Resolution", value: "2560×1440 (QHD)" },
      { label: "Panel", value: "VA, 165Hz, 1ms" },
      { label: "Sync", value: "AMD FreeSync Premium" },
      { label: "Ports", value: "HDMI, DisplayPort" },
      { label: "Warranty", value: "1 year" },
    ],
  },
  {
    name: "LG 24MP400 24\" FHD IPS",
    brand: "LG",
    category: "monitors",
    price: 32_500,
    stock: 18,
    condition: "NEW",
    description:
      "A no-nonsense 1080p IPS panel for a second screen or an office desk. Thin bezels, decent viewing angles, and one of the cheapest ways to add screen space.",
    specs: [
      { label: "Size", value: "24 inch" },
      { label: "Resolution", value: "1920×1080 (FHD)" },
      { label: "Panel", value: "IPS, 75Hz" },
      { label: "Ports", value: "2× HDMI, VGA" },
      { label: "Mount", value: "100×100 VESA" },
      { label: "Warranty", value: "1 year" },
    ],
  },
  {
    name: "Dell P2422H 24\" FHD IPS",
    brand: "Dell",
    category: "monitors",
    price: 46_000,
    stock: 11,
    condition: "NEW",
    description:
      "The default office monitor for a reason. Fully height and pivot adjustable, so you can set it up properly instead of stacking it on books.",
    specs: [
      { label: "Size", value: "24 inch" },
      { label: "Resolution", value: "1920×1080 (FHD)" },
      { label: "Panel", value: "IPS, 60Hz" },
      { label: "Stand", value: "Height, pivot, tilt, swivel" },
      { label: "Ports", value: "HDMI, DisplayPort, VGA" },
      { label: "Warranty", value: "3 years Dell warranty" },
    ],
  },
  {
    name: "LG UltraWide 29\" 21:9",
    brand: "LG",
    category: "monitors",
    price: 78_000,
    compareAtPrice: 88_000,
    stock: 3,
    condition: "NEW",
    description:
      "A 21:9 panel is genuinely transformative for spreadsheets and video timelines. Two documents side by side with no bezel between them.",
    specs: [
      { label: "Size", value: "29 inch" },
      { label: "Resolution", value: "2560×1080 (UW-FHD)" },
      { label: "Aspect ratio", value: "21:9" },
      { label: "Panel", value: "IPS, 75Hz" },
      { label: "Ports", value: "2× HDMI, DisplayPort" },
      { label: "Warranty", value: "1 year" },
    ],
  },

  // ── Keyboards & Mice ──────────────────────────────────────────────────────
  {
    name: "Logitech MX Master 3S Wireless Mouse",
    brand: "Logitech",
    category: "keyboards-mice",
    price: 32_500,
    stock: 9,
    condition: "NEW",
    featured: true,
    description:
      "Still the best productivity mouse made. The electromagnetic scroll wheel flicks through a thousand-line spreadsheet in one gesture, and it pairs to three machines at once.",
    specs: [
      { label: "Sensor", value: "8000 DPI Darkfield" },
      { label: "Buttons", value: "7 programmable" },
      { label: "Connection", value: "Bluetooth + Logi Bolt" },
      { label: "Battery", value: "Up to 70 days" },
      { label: "Multi-device", value: "3 devices" },
      { label: "Warranty", value: "1 year" },
    ],
  },
  {
    name: "Logitech MK270 Wireless Keyboard & Mouse",
    brand: "Logitech",
    category: "keyboards-mice",
    price: 6_900,
    stock: 30,
    condition: "NEW",
    description:
      "The combo we put on almost every office build. Cheap, reliable, one USB receiver, and spare parts are available anywhere.",
    specs: [
      { label: "Type", value: "Wireless combo" },
      { label: "Connection", value: "2.4GHz USB receiver" },
      { label: "Battery", value: "Up to 24 months" },
      { label: "Keys", value: "Full size with numpad" },
      { label: "Layout", value: "English (US)" },
      { label: "Warranty", value: "1 year" },
    ],
  },
  {
    name: "Logitech G102 Lightsync Gaming Mouse",
    brand: "Logitech",
    category: "keyboards-mice",
    price: 5_200,
    stock: 22,
    condition: "NEW",
    description:
      "The budget gaming mouse that outperforms its price. Accurate sensor, RGB you can turn off, and light enough for fast flicks without feeling hollow.",
    specs: [
      { label: "Sensor", value: "8000 DPI" },
      { label: "Buttons", value: "6 programmable" },
      { label: "Lighting", value: "LIGHTSYNC RGB" },
      { label: "Connection", value: "USB wired" },
      { label: "Polling", value: "1000Hz" },
      { label: "Warranty", value: "2 years" },
    ],
  },
  {
    name: "Redragon K552 Mechanical Keyboard",
    brand: "Redragon",
    category: "keyboards-mice",
    price: 9_800,
    stock: 15,
    condition: "NEW",
    description:
      "A TKL mechanical board at a membrane price. Outemu blue switches with a proper click — loud, which some people love and their colleagues don't.",
    specs: [
      { label: "Type", value: "Mechanical, TKL" },
      { label: "Switches", value: "Outemu Blue" },
      { label: "Backlight", value: "Red LED" },
      { label: "Connection", value: "USB wired" },
      { label: "Layout", value: "English (US)" },
      { label: "Warranty", value: "1 year" },
    ],
  },
  {
    name: "Apple Magic Keyboard with Touch ID",
    brand: "Apple",
    category: "keyboards-mice",
    price: 42_000,
    stock: 4,
    condition: "NEW",
    description:
      "For Mac users who want Touch ID on the desk rather than reaching for the laptop. Low-profile scissor keys, and it pairs instantly to any Apple silicon Mac.",
    specs: [
      { label: "Type", value: "Wireless, low-profile" },
      { label: "Connection", value: "Bluetooth 5.1" },
      { label: "Battery", value: "Up to 1 month" },
      { label: "Feature", value: "Touch ID sensor" },
      { label: "Layout", value: "English (US)" },
      { label: "Warranty", value: "1 year" },
    ],
  },
  {
    name: "Keychron K8 Wireless Mechanical",
    brand: "Keychron",
    category: "keyboards-mice",
    price: 24_500,
    stock: 6,
    condition: "NEW",
    description:
      "Hot-swappable, so you can change the switches without soldering. Works with Mac and Windows layouts and pairs to three devices.",
    specs: [
      { label: "Type", value: "Mechanical, TKL, hot-swappable" },
      { label: "Switches", value: "Gateron Brown" },
      { label: "Connection", value: "Bluetooth 5.1 + USB-C" },
      { label: "Multi-device", value: "3 devices" },
      { label: "Battery", value: "4000mAh" },
      { label: "Warranty", value: "1 year" },
    ],
  },

  // ── Storage ───────────────────────────────────────────────────────────────
  {
    name: "Samsung 980 PRO 1TB NVMe SSD",
    brand: "Samsung",
    category: "storage",
    price: 34_500,
    compareAtPrice: 39_000,
    stock: 13,
    condition: "NEW",
    featured: true,
    description:
      "PCIe 4.0 at 7000MB/s. The single most noticeable upgrade you can make to an older machine — boot times and app launches stop being something you wait for.",
    specs: [
      { label: "Capacity", value: "1TB" },
      { label: "Interface", value: "PCIe 4.0 NVMe M.2" },
      { label: "Read speed", value: "Up to 7000 MB/s" },
      { label: "Write speed", value: "Up to 5000 MB/s" },
      { label: "Form factor", value: "M.2 2280" },
      { label: "Warranty", value: "5 years" },
    ],
  },
  {
    name: "Crucial BX500 480GB SATA SSD",
    brand: "Crucial",
    category: "storage",
    price: 11_500,
    stock: 25,
    condition: "NEW",
    description:
      "The cheapest way to bring an old hard-drive laptop back to life. If a machine takes four minutes to boot, this fixes it.",
    specs: [
      { label: "Capacity", value: "480GB" },
      { label: "Interface", value: "SATA III 6Gb/s" },
      { label: "Read speed", value: "Up to 540 MB/s" },
      { label: "Form factor", value: "2.5 inch" },
      { label: "Warranty", value: "3 years" },
    ],
  },
  {
    name: "Seagate Barracuda 2TB HDD",
    brand: "Seagate",
    category: "storage",
    price: 19_800,
    stock: 16,
    condition: "NEW",
    description:
      "Cheap bulk storage for archives, media libraries and backups. Pair it with an SSD for the system drive and you get speed where it matters and capacity where it doesn't.",
    specs: [
      { label: "Capacity", value: "2TB" },
      { label: "Interface", value: "SATA III 6Gb/s" },
      { label: "Speed", value: "7200 RPM" },
      { label: "Cache", value: "256MB" },
      { label: "Form factor", value: "3.5 inch" },
      { label: "Warranty", value: "2 years" },
    ],
  },
  {
    name: "WD My Passport 2TB External Drive",
    brand: "Western Digital",
    category: "storage",
    price: 24_500,
    stock: 12,
    condition: "NEW",
    description:
      "Bus-powered portable drive with hardware encryption. Small enough for a laptop bag and it doesn't need a separate power brick.",
    specs: [
      { label: "Capacity", value: "2TB" },
      { label: "Interface", value: "USB 3.2 Gen 1" },
      { label: "Encryption", value: "256-bit AES hardware" },
      { label: "Form factor", value: "2.5 inch portable" },
      { label: "Warranty", value: "3 years" },
    ],
  },
  {
    name: "Kingston DataTraveler 128GB USB 3.2",
    brand: "Kingston",
    category: "storage",
    price: 3_200,
    stock: 40,
    condition: "NEW",
    description:
      "A reliable everyday flash drive. Metal body, keyring loop, and it survives being carried around in a pocket.",
    specs: [
      { label: "Capacity", value: "128GB" },
      { label: "Interface", value: "USB 3.2 Gen 1" },
      { label: "Read speed", value: "Up to 200 MB/s" },
      { label: "Body", value: "Metal with keyring" },
      { label: "Warranty", value: "5 years" },
    ],
  },

  // ── Components ────────────────────────────────────────────────────────────
  {
    name: "Kingston Fury Beast 16GB DDR4 3200MHz",
    brand: "Kingston",
    category: "components",
    price: 9_500,
    stock: 28,
    condition: "NEW",
    description:
      "The most common RAM upgrade we sell. If your machine is struggling with too many browser tabs, 16GB is usually the fix.",
    specs: [
      { label: "Capacity", value: "16GB (1×16GB)" },
      { label: "Type", value: "DDR4 SDRAM" },
      { label: "Speed", value: "3200MHz" },
      { label: "Latency", value: "CL16" },
      { label: "Voltage", value: "1.35V" },
      { label: "Warranty", value: "Lifetime" },
    ],
  },
  {
    name: "Corsair Vengeance 32GB DDR5 5600MHz",
    brand: "Corsair",
    category: "components",
    price: 28_500,
    stock: 9,
    condition: "NEW",
    description:
      "For DDR5 platforms and anyone running virtual machines or heavy editing workloads. Low-profile heatspreader clears most air coolers.",
    specs: [
      { label: "Capacity", value: "32GB (2×16GB)" },
      { label: "Type", value: "DDR5 SDRAM" },
      { label: "Speed", value: "5600MHz" },
      { label: "Latency", value: "CL36" },
      { label: "Profile", value: "AMD EXPO / Intel XMP 3.0" },
      { label: "Warranty", value: "Lifetime" },
    ],
  },
  {
    name: "NVIDIA GeForce RTX 4060 8GB",
    brand: "MSI",
    category: "components",
    price: 132_000,
    compareAtPrice: 145_000,
    stock: 5,
    condition: "NEW",
    featured: true,
    description:
      "The sensible 1080p and 1440p card. Runs cool, sips power compared to the tier above, and DLSS 3 frame generation does a lot of heavy lifting.",
    specs: [
      { label: "Memory", value: "8GB GDDR6" },
      { label: "Boost clock", value: "2460 MHz" },
      { label: "Interface", value: "PCIe 4.0 x8" },
      { label: "Outputs", value: "3× DP 1.4a, 1× HDMI 2.1" },
      { label: "Power", value: "115W TGP" },
      { label: "Warranty", value: "3 years" },
    ],
  },
  {
    name: "Cooler Master MWE 650W 80+ Bronze",
    brand: "Cooler Master",
    category: "components",
    price: 16_500,
    stock: 14,
    condition: "NEW",
    description:
      "A power supply is the one part you should never cheap out on. This one is genuinely 80+ Bronze certified with proper protection circuitry.",
    specs: [
      { label: "Wattage", value: "650W" },
      { label: "Efficiency", value: "80+ Bronze" },
      { label: "Modular", value: "Non-modular" },
      { label: "Fan", value: "120mm HDB" },
      { label: "Protections", value: "OVP, OPP, SCP, OTP" },
      { label: "Warranty", value: "5 years" },
    ],
  },
  {
    name: "AMD Ryzen 5 7600 Processor",
    brand: "AMD",
    category: "components",
    price: 68_000,
    stock: 6,
    condition: "NEW",
    description:
      "Six fast cores on the AM5 platform with a clear upgrade path. Ships with a stock cooler that's genuinely adequate.",
    specs: [
      { label: "Cores / Threads", value: "6 / 12" },
      { label: "Base clock", value: "3.8 GHz" },
      { label: "Boost clock", value: "5.1 GHz" },
      { label: "Socket", value: "AM5" },
      { label: "TDP", value: "65W" },
      { label: "Cooler", value: "Wraith Stealth included" },
    ],
  },
  {
    name: "TP-Link Archer AX23 WiFi 6 Router",
    brand: "TP-Link",
    category: "components",
    price: 14_500,
    stock: 11,
    condition: "NEW",
    description:
      "WiFi 6 at a price that makes sense for a home or small office. Handles a household of phones, laptops and a smart TV without dropping anyone.",
    specs: [
      { label: "Standard", value: "WiFi 6 (802.11ax)" },
      { label: "Speed", value: "AX1800 dual band" },
      { label: "Antennas", value: "4× external" },
      { label: "Ports", value: "4× Gigabit LAN, 1× WAN" },
      { label: "Features", value: "OFDMA, MU-MIMO, WPA3" },
      { label: "Warranty", value: "3 years" },
    ],
  },

  // ── Audio & Webcams ───────────────────────────────────────────────────────
  {
    name: "Logitech C920 HD Pro Webcam",
    brand: "Logitech",
    category: "audio-webcams",
    price: 21_500,
    stock: 10,
    condition: "NEW",
    description:
      "Still the webcam to buy for meetings and teaching. 1080p30, autofocus that behaves, and dual mics good enough that people stop asking you to repeat yourself.",
    specs: [
      { label: "Resolution", value: "1080p at 30fps" },
      { label: "Focus", value: "Autofocus" },
      { label: "Microphones", value: "Dual stereo" },
      { label: "Field of view", value: "78 degrees" },
      { label: "Mount", value: "Clip + tripod thread" },
      { label: "Warranty", value: "1 year" },
    ],
  },
  {
    name: "HyperX Cloud II Gaming Headset",
    brand: "HyperX",
    category: "audio-webcams",
    price: 24_500,
    compareAtPrice: 28_000,
    stock: 7,
    condition: "NEW",
    description:
      "Comfortable enough to wear for a full working day, which is more than most gaming headsets manage. Detachable mic means it doubles as plain headphones.",
    specs: [
      { label: "Drivers", value: "53mm dynamic" },
      { label: "Connection", value: "USB + 3.5mm" },
      { label: "Microphone", value: "Detachable, noise-cancelling" },
      { label: "Surround", value: "Virtual 7.1 via USB" },
      { label: "Weight", value: "320 g" },
      { label: "Warranty", value: "1 year" },
    ],
  },
  {
    name: "Logitech Z313 2.1 Speaker System",
    brand: "Logitech",
    category: "audio-webcams",
    price: 12_800,
    stock: 9,
    condition: "NEW",
    description:
      "A compact 2.1 setup with a subwoofer that actually does something. Fine for a desk, a shop counter or a small room.",
    specs: [
      { label: "Configuration", value: "2.1 with subwoofer" },
      { label: "Total power", value: "50W peak" },
      { label: "Connection", value: "3.5mm + headphone jack" },
      { label: "Controls", value: "Wired remote" },
      { label: "Warranty", value: "1 year" },
    ],
  },
  {
    name: "Blue Yeti USB Microphone",
    brand: "Logitech",
    category: "audio-webcams",
    price: 38_000,
    stock: 4,
    condition: "NEW",
    description:
      "The default podcast and voiceover mic. Four pickup patterns, zero drivers, and it plugs straight into USB. Popular with our streaming customers.",
    specs: [
      { label: "Type", value: "Condenser, USB" },
      { label: "Patterns", value: "Cardioid, omni, figure-8, stereo" },
      { label: "Sample rate", value: "48kHz / 16-bit" },
      { label: "Monitoring", value: "Zero-latency headphone out" },
      { label: "Mount", value: "Desk stand + tripod thread" },
      { label: "Warranty", value: "2 years" },
    ],
  },

  // ── Accessories ───────────────────────────────────────────────────────────
  {
    name: "Anker 65W GaN USB-C Charger",
    brand: "Anker",
    category: "accessories",
    price: 9_900,
    stock: 20,
    condition: "NEW",
    description:
      "Replaces a laptop brick and two phone chargers. GaN means it runs cooler and packs smaller, and 65W covers most ultrabooks plus a phone at the same time.",
    specs: [
      { label: "Output", value: "65W total" },
      { label: "Ports", value: "2× USB-C, 1× USB-A" },
      { label: "Technology", value: "GaN II" },
      { label: "Compatibility", value: "PD 3.0, PPS" },
      { label: "Warranty", value: "18 months" },
    ],
  },
  {
    name: "UGREEN 7-in-1 USB-C Hub",
    brand: "UGREEN",
    category: "accessories",
    price: 8_500,
    stock: 18,
    condition: "NEW",
    description:
      "The dongle most modern laptops need. HDMI, three USB ports, an SD reader and 100W pass-through charging in something the size of a lighter.",
    specs: [
      { label: "Ports", value: "HDMI, 3× USB-A, SD, microSD, USB-C" },
      { label: "HDMI", value: "4K at 30Hz" },
      { label: "Charging", value: "100W pass-through" },
      { label: "Body", value: "Aluminium" },
      { label: "Warranty", value: "1 year" },
    ],
  },
  {
    name: "Laptop Backpack with USB Port",
    brand: "Dani Brothers",
    category: "accessories",
    price: 6_500,
    stock: 24,
    condition: "NEW",
    description:
      "Fits up to a 17-inch laptop with proper padding, a separate document sleeve, and a USB pass-through so you can charge your phone from a power bank inside the bag.",
    specs: [
      { label: "Fits", value: "Up to 17 inch laptops" },
      { label: "Material", value: "Water-resistant polyester" },
      { label: "Compartments", value: "Laptop, documents, accessories" },
      { label: "Feature", value: "USB charging pass-through" },
      { label: "Warranty", value: "6 months" },
    ],
  },
  {
    name: "Laptop Cooling Pad — 5 Fan RGB",
    brand: "Dani Brothers",
    category: "accessories",
    price: 4_800,
    stock: 26,
    condition: "NEW",
    description:
      "Worth it in a Pakistani summer. Five fans, adjustable height, and RGB you can switch off. Drops surface temperatures noticeably on gaming laptops.",
    specs: [
      { label: "Fans", value: "5× 70mm" },
      { label: "Fits", value: "Up to 17 inch laptops" },
      { label: "Lighting", value: "RGB, switchable" },
      { label: "Power", value: "USB powered" },
      { label: "Height", value: "4 adjustable levels" },
    ],
  },
  {
    name: "HDMI 2.1 Cable 2m — 8K Certified",
    brand: "UGREEN",
    category: "accessories",
    price: 2_400,
    stock: 45,
    condition: "NEW",
    description:
      "Certified Ultra High Speed HDMI. If you are running 4K at 120Hz or hooking a console to a monitor, the cheap cable in the drawer is usually the problem.",
    specs: [
      { label: "Length", value: "2 metres" },
      { label: "Standard", value: "HDMI 2.1, 48Gbps" },
      { label: "Supports", value: "8K at 60Hz, 4K at 120Hz" },
      { label: "Construction", value: "Braided, gold-plated" },
      { label: "Warranty", value: "1 year" },
    ],
  },
  {
    name: "Thermal Paste — Arctic MX-4 4g",
    brand: "Arctic",
    category: "accessories",
    price: 1_800,
    stock: 50,
    condition: "NEW",
    description:
      "If your laptop is a few years old and the fans never stop, repasting usually fixes it. We use this in every machine that comes through the workshop.",
    specs: [
      { label: "Quantity", value: "4 grams" },
      { label: "Conductivity", value: "8.5 W/mK" },
      { label: "Type", value: "Non-conductive, non-curing" },
      { label: "Applications", value: "Approx. 8–12" },
      { label: "Warranty", value: "Not applicable" },
    ],
  },
  {
    name: "Wireless Presenter with Laser Pointer",
    brand: "Dani Brothers",
    category: "accessories",
    price: 3_200,
    stock: 15,
    condition: "NEW",
    description:
      "For anyone presenting or teaching. 2.4GHz receiver stores in the body, and the red laser is bright enough for a lit room.",
    specs: [
      { label: "Connection", value: "2.4GHz USB receiver" },
      { label: "Range", value: "Up to 15 metres" },
      { label: "Laser", value: "Class 3R red" },
      { label: "Battery", value: "1× AAA" },
      { label: "Warranty", value: "6 months" },
    ],
  },
  {
    name: "Monitor Arm — Single Gas Spring",
    brand: "Dani Brothers",
    category: "accessories",
    price: 7_200,
    stock: 12,
    condition: "NEW",
    description:
      "Frees up your entire desk and puts the screen at eye level, where it should be. Gas spring means it moves with one finger.",
    specs: [
      { label: "Fits", value: "13–32 inch monitors" },
      { label: "Load", value: "2–9 kg" },
      { label: "Mount", value: "C-clamp or grommet" },
      { label: "VESA", value: "75×75, 100×100" },
      { label: "Warranty", value: "1 year" },
    ],
  },

  // ── Security & CCTV ─────────────────────────────────────────────────────
  {
    name: "Hikvision DS-2CE16D0T-IRPF 2MP Bullet Camera",
    brand: "Hikvision",
    category: "security-cctv",
    price: 6_500,
    stock: 24,
    condition: "NEW",
    featured: true,
    description:
      "The workhorse bullet camera we install most. 1080p with 30m infrared night vision, IP67 weatherproof body, and a 2.8mm lens that covers a shop front or driveway in one shot.",
    specs: [
      { label: "Resolution", value: "2MP 1080p" },
      { label: "Night vision", value: "30m Smart IR" },
      { label: "Lens", value: "2.8mm fixed" },
      { label: "Weatherproof", value: "IP67" },
      { label: "Power", value: "12V DC" },
      { label: "Warranty", value: "1 year" },
    ],
  },
  {
    name: "Hikvision DS-2CD2143G2-IS 4MP Dome Camera",
    brand: "Hikvision",
    category: "security-cctv",
    price: 11_500,
    compareAtPrice: 13_000,
    stock: 12,
    condition: "NEW",
    featured: true,
    description:
      "4MP dome for indoor or covered outdoor use. The vandal-resistant housing suits offices and shops, and AcuSense filters out false alarms from animals and moving trees.",
    specs: [
      { label: "Resolution", value: "4MP 2560×1440" },
      { label: "Night vision", value: "30m IR" },
      { label: "Lens", value: "2.8mm fixed" },
      { label: "Features", value: "AcuSense motion detection" },
      { label: "Weatherproof", value: "IP67" },
      { label: "Warranty", value: "1 year" },
    ],
  },
  {
    name: "Dahua IPC-HFW1230M 2MP Bullet Camera",
    brand: "Dahua",
    category: "security-cctv",
    price: 5_800,
    stock: 18,
    condition: "NEW",
    description:
      "A reliable budget bullet that punches above its price. Starlight sensor holds a usable colour image in low light before switching to IR.",
    specs: [
      { label: "Resolution", value: "2MP 1080p" },
      { label: "Night vision", value: "30m IR" },
      { label: "Sensor", value: "1/2.8\" Starlight CMOS" },
      { label: "Lens", value: "2.8mm fixed" },
      { label: "Weatherproof", value: "IP67" },
      { label: "Warranty", value: "1 year" },
    ],
  },
  {
    name: "TP-Link Tapo C320WB 4MP Outdoor Wi-Fi Camera",
    brand: "TP-Link",
    category: "security-cctv",
    price: 9_900,
    stock: 15,
    condition: "NEW",
    featured: true,
    description:
      "Wi-Fi camera with no NVR needed — footage goes straight to your phone. Colour night vision and person detection make it the easiest way to cover a gate or porch.",
    specs: [
      { label: "Resolution", value: "4MP 2K QHD" },
      { label: "Night vision", value: "Colour night vision" },
      { label: "Connection", value: "2.4GHz Wi-Fi" },
      { label: "Detection", value: "Person & pet detection" },
      { label: "Storage", value: "microSD up to 256GB" },
      { label: "Warranty", value: "2 years" },
    ],
  },
  {
    name: "Hikvision DS-7604NI-I1/4P 4-Channel NVR Kit",
    brand: "Hikvision",
    category: "security-cctv",
    price: 28_500,
    stock: 4,
    condition: "NEW",
    description:
      "The recorder half of a proper four-camera setup. PoE ports mean each camera gets power and data over one cable, and you can watch live from the Hik-Connect app anywhere.",
    specs: [
      { label: "Channels", value: "4 IP cameras" },
      { label: "PoE", value: "4× PoE ports" },
      { label: "Output", value: "HDMI + VGA" },
      { label: "Playback", value: "4-ch simultaneous" },
      { label: "App", value: "Hik-Connect" },
      { label: "Warranty", value: "1 year" },
    ],
  },
  {
    name: "Dahua NVR4104HS-4P 4-Channel PoE Recorder",
    brand: "Dahua",
    category: "security-cctv",
    price: 24_000,
    stock: 5,
    condition: "NEW",
    description:
      "Compact four-channel NVR with built-in PoE. Pairs cleanly with the Dahua bullet and dome cameras above — one power adapter runs the whole kit.",
    specs: [
      { label: "Channels", value: "4 IP cameras" },
      { label: "PoE", value: "4× PoE ports" },
      { label: "Output", value: "HDMI + VGA" },
      { label: "HDD", value: "1× SATA up to 10TB" },
      { label: "App", value: "DMSS" },
      { label: "Warranty", value: "1 year" },
    ],
  },
  {
    name: "CCTV Installation Kit — 4 Cameras + Cables + 1TB",
    brand: "Dani Brothers",
    category: "security-cctv",
    price: 52_000,
    compareAtPrice: 58_000,
    stock: 3,
    condition: "NEW",
    featured: true,
    description:
      "Everything for a four-camera shop or home install: 4× 2MP bullets, a 4-channel NVR with PoE, 100m of cable, connectors and a 1TB drive. Fitting available in Karachi — ask on WhatsApp.",
    specs: [
      { label: "Cameras", value: "4× 2MP IP bullet" },
      { label: "Recorder", value: "4-ch PoE NVR" },
      { label: "Storage", value: "1TB surveillance HDD" },
      { label: "Cable", value: "100m coax/UTP kit" },
      { label: "Install", value: "Optional, Karachi" },
      { label: "Warranty", value: "1 year on kit" },
    ],
  },
  {
    name: "WD Purple 2TB Surveillance HDD",
    brand: "Western Digital",
    category: "security-cctv",
    price: 22_500,
    stock: 9,
    condition: "NEW",
    description:
      "Built for 24/7 write loads — a normal desktop drive dies faster in an NVR. If you are recording four cameras continuously, this is the drive that belongs in the box.",
    specs: [
      { label: "Capacity", value: "2TB" },
      { label: "Workload", value: "180TB/year" },
      { label: "RPM", value: "5400 RPM" },
      { label: "Cache", value: "256MB" },
      { label: "Form factor", value: "3.5 inch" },
      { label: "Warranty", value: "3 years" },
    ],
  },
]

async function main() {
  console.log("Seeding Dani Brothers…")

  // Idempotent: safe to re-run during development.
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.inquiry.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  const categoryIdBySlug = new Map<string, string>()
  for (const category of categories) {
    const created = await prisma.category.create({ data: category })
    categoryIdBySlug.set(created.slug, created.id)
  }
  console.log(`  ${categories.length} categories`)

  for (const product of products) {
    const categoryId = categoryIdBySlug.get(product.category)
    if (!categoryId) throw new Error(`Unknown category: ${product.category}`)

    const slug = slugify(product.name)
    const images = imagesForProduct(product.category, slug)

    await prisma.product.create({
      data: {
        name: product.name,
        slug,
        brand: product.brand,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice ?? null,
        stock: product.stock,
        condition: product.condition,
        featured: product.featured ?? false,
        images: JSON.stringify(images),
        specs: JSON.stringify(product.specs),
        categoryId,
      },
    })
  }
  console.log(`  ${products.length} products`)

  await prisma.user.create({
    data: {
      name: "Dani Brothers Admin",
      email: "admin@danibrothers.com",
      passwordHash: await bcrypt.hash("admin1234", 12),
      role: "ADMIN",
      phone: "+92 300 123 4567",
    },
  })
  await prisma.user.create({
    data: {
      name: "Ahmed Raza",
      email: "customer@example.com",
      passwordHash: await bcrypt.hash("customer1234", 12),
      role: "CUSTOMER",
      phone: "+92 321 987 6543",
    },
  })
  console.log("  2 users (admin@danibrothers.com / admin1234)")

  console.log("Done.")
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/["']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

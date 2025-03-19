import type { LucideIcon } from "lucide-react";
import { DiscIcon, MessageCircle, X } from "lucide-react";

export interface SocialLink {
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface FooterLink {
  name: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterData {
  socialLinks: SocialLink[];
  sections: FooterSection[];
  legal: {
    copyright: string;
    links: FooterLink[];
  };
}

export const footerData: FooterData = {
  socialLinks: [
    {
      name: "X",
      href: "https://twitter.com/hemi",
      icon: X,
    },
    {
      name: "Discord",
      href: "https://discord.gg/hemi",
      icon: DiscIcon,
    },
    {
      name: "Telegram",
      href: "https://t.me/hemi",
      icon: MessageCircle,
    },
  ],
  sections: [
    {
      title: "App",
      links: [
        {
          name: "Ecosystem",
          href: "/ecosystem",
        },
        {
          name: "Block explorer",
          href: "/explorer",
        },
      ],
    },
    {
      title: "Company",
      links: [
        {
          name: "About",
          href: "/about",
        },
        {
          name: "Blog",
          href: "/blog",
        },
        {
          name: "Careers",
          href: "/careers",
        },
        {
          name: "Brand",
          href: "/brand",
        },
      ],
    },
    {
      title: "Resources",
      links: [
        {
          name: "Docs",
          href: "/docs",
        },
        {
          name: "Github",
          href: "https://github.com/hemi",
        },
        {
          name: "Changelog",
          href: "/changelog",
        },
      ],
    },
  ],
  legal: {
    copyright: "© 2025 - Hemi Labs, Inc.",
    links: [
      {
        name: "Privacy",
        href: "/privacy",
      },
      {
        name: "Terms",
        href: "/terms",
      },
    ],
  },
};

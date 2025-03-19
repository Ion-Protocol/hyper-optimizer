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
      href: "https://x.com/hypurr_co",
      icon: X,
    },
    {
      name: "Telegram",
      href: "https://t.me/+kQPx4WNpHEk4MmRl",
      icon: MessageCircle,
    },
  ],
  sections: [
    {
      title: "App",
      links: [
        {
          name: "Ecosystem",
          href: "https://www.hypurr.co/ecosystem-map",
        },
      ],
    },
    {
      title: "Company",
      links: [
        {
          name: "About",
          href: "https://www.hypurr.co/about",
        },
        {
          name: "Blog",
          href: "https://www.hypurr.co/blog",
        },
      ],
    },
    {
      title: "Resources",
      links: [],
    },
  ],
  legal: {
    copyright: "© 2025 - Hypurr Collective, Inc.",
    links: [
      {
        name: "Privacy",
        href: "https://www.hypurr.co/privacy-policy",
      },
      {
        name: "Terms",
        href: "https://www.hypurr.co/terms-and-conditions",
      },
    ],
  },
};

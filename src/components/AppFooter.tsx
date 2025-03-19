import DiscordIcon from "@/assets/svgs/socials/Discord.svg?react";
import TelegramIcon from "@/assets/svgs/socials/Telegram.svg?react";
import XIcon from "@/assets/svgs/socials/X.svg?react";

export function AppFooter() {
  return (
    <footer className="w-full bg-background mt-[100px]">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Social Icons */}
          <div className="flex gap-4 md:gap-6 items-start">
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <XIcon className="h-5 w-5" />
              <span className="sr-only">X</span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <DiscordIcon className="h-5 w-5" />
              <span className="sr-only">Discord</span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <TelegramIcon className="h-5 w-5" />
              <span className="sr-only">Telegram</span>
            </a>
          </div>

          {/* Right side links */}
          <div className="grid grid-cols-3 gap-8">
            {/* App Links */}
            <div className="space-y-4">
              <h3 className="font-medium">App</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Ecosystem
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Block explorer
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h3 className="font-medium">Company</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Brand
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources Links */}
            <div className="space-y-4">
              <h3 className="font-medium">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Docs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Github
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Changelog
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground">© 2025 - Hemi Labs, Inc.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

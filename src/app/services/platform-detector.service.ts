import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: "root",
})
export class PlatformDetectorService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // isMobile(): boolean {
  //   return (
  //     isPlatformBrowser(this.platformId) &&
  //     typeof navigator !== "undefined" &&
  //     /Mobi|Android/i.test(navigator.userAgent)
  //   );
  // }
  isMobile(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return (
        typeof navigator !== "undefined" &&
        /Mobi|Android/i.test(navigator.userAgent)
      );
    }
    return false; // Not in a browser, so return false
  }

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}

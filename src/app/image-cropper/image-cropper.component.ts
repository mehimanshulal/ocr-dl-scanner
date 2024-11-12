import { CommonModule } from "@angular/common";

import { Component } from "@angular/core";
import {
  ImageCropperComponent as NgxImageCropperComponent,
  ImageCroppedEvent,
  LoadedImage,
} from "ngx-image-cropper";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { WebcamImage, WebcamModule } from "ngx-webcam";
import { Subject } from "rxjs";

@Component({
  selector: "app-image-cropper",
  standalone: true,
  imports: [NgxImageCropperComponent, WebcamModule, CommonModule],
  templateUrl: "./image-cropper.component.html",
  styleUrls: ["./image-cropper.component.css"],
})
export class ImageCropperComponent {
  capturedImageDataUrl: string | undefined = undefined;
  imageChangedEvent: Event | null = null;
  loadedImage: SafeUrl | null = null;
  croppedImage: SafeUrl | null = null;
  cropEvent: ImageCroppedEvent | null = null;
  isImageCropped: boolean = false;
  isImageCaptured: boolean = false;
  triggerCapture$ = new Subject<void>(); // Observable trigger for webcam capture

  constructor(private sanitizer: DomSanitizer) {}

  captureImage(): void {
    this.triggerCapture$.next(); // Trigger webcam capture
  }

  handleImageCapture(webcamImage: WebcamImage): void {
    console.log("handleImageCapture called", webcamImage.imageAsDataUrl);
    this.isImageCaptured = true;
    this.isImageCropped = true;
    this.capturedImageDataUrl = webcamImage.imageAsDataUrl;
  }

  // triggers everytimes, with cropper touched
  imageCropped(event: ImageCroppedEvent): void {
    this.cropEvent = event;
  }

  cropImage(): void {
    if (this.cropEvent && this.cropEvent.objectUrl) {
      // Set the cropped image for final display
      this.croppedImage = this.cropEvent.objectUrl
        ? this.sanitizer.bypassSecurityTrustUrl(this.cropEvent.objectUrl)
        : null;
      this.isImageCropped = false;
    }
  }

  imageLoaded(image: LoadedImage): void {}

  cropperReady(): void {}

  loadImageFailed(): void {
    alert("Failed to load the image.");
  }

  // Helper function to convert data URI to Blob
  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }
}

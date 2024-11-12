import {
  BarcodeFormat,
  DecodeHintType,
  BrowserMultiFormatReader,
  NotFoundException,
} from "@zxing/library";
import { Component } from "@angular/core";
import { Jimp } from "jimp";
// import * as Sentry from "@sentry/angular";
import {
  ImageCropperComponent as NgxImageCropperComponent,
  ImageCroppedEvent,
  LoadedImage,
} from "ngx-image-cropper";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { WebcamImage, WebcamInitError, WebcamModule } from "ngx-webcam";
import { Subject, Observable } from "rxjs";
import { CommonModule } from "@angular/common";
import { PlatformDetectorService } from "../services/platform-detector.service";
import LogRocket from "logrocket";

@Component({
  selector: "app-ocr-reader-form",
  standalone: true,
  templateUrl: "./ocr-reader-form.component.html",
  styleUrls: ["./ocr-reader-form.component.css"],
  imports: [WebcamModule, CommonModule, NgxImageCropperComponent],
})
export class OcrReaderFormComponent {
  selectedFile: File | null = null;
  ocrResult: string = "";
  loading: boolean = false;
  imageData: string | ArrayBuffer | null = null;
  dlData: string = "";

  isProcessing: boolean = false;
  progress: number = 0;
  showWebcam: boolean = false;
  isMobile: boolean = false;
  BrowserReader: any;
  hints: any;
  // for image cropper
  imageChangedEvent: Event | null = null;
  croppedImage: SafeUrl | null = null;
  loadedImage: SafeUrl | null = null;
  cropEvent: ImageCroppedEvent | null = null;
  isImageOpenedInCropper: boolean = false; // for hiding the loaded image after cropped

  capturedImageDataUrl: string | undefined = undefined;
  isImageCropped: boolean = false;
  isImageCaptured: boolean = false;
  triggerCapture$: Subject<void> = new Subject<void>(); // Observable trigger for webcam capture

  constructor(
    private platformDetectorService: PlatformDetectorService,
    private sanitizer: DomSanitizer
  ) {
    this.hints = new Map();
    this.hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.PDF_417,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.DATA_MATRIX,
    ]);
    this.BrowserReader = new BrowserMultiFormatReader(this.hints);
    LogRocket.init("oik1hm/angular_ocr_reader");
    LogRocket.identify("meHimanshu123", {
      name: "Himanshu Lal",
      email: "himanshulal9994@gmail.com",
    });
  }

  ngOnInit() {
    this.showWebcam = this.platformDetectorService.isMobile();
    this.isMobile = this.platformDetectorService.isMobile();
  }

  uploadAndProcessImage(file: File) {
    this.isProcessing = true;
    this.progress = 0;

    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
      const imageDataUrl = e.target?.result as string;
      try {
        await this.processImage(imageDataUrl);
      } catch (error) {
        console.error("Image processing failed:", error);
        this.ocrResult = `Image processing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
      } finally {
        this.isProcessing = false;
        this.progress = 100;
      }
    };
    fileReader.onprogress = (event) => {
      if (event.lengthComputable) {
        this.progress = Math.round((event.loaded / event.total) * 100);
      }
    };
    fileReader.readAsDataURL(file);
  }

  toggleWebcam() {
    this.showWebcam = !this.showWebcam;
  }

  handleFormReset() {
    this.imageChangedEvent = null;
    this.isImageOpenedInCropper = false;
    this.croppedImage = null;
    this.ocrResult = "";
  }

  handleImageCapture(webcamImage: WebcamImage): void {
    this.isImageOpenedInCropper = true;
    this.capturedImageDataUrl = webcamImage.imageAsDataUrl;
  }
  captureImage(): void {
    this.triggerCapture$.next(); // Trigger webcam capture
  }
  get triggerObservable(): Observable<void> {
    return this.triggerCapture$.asObservable();
  }
  handleInitError(error: WebcamInitError): void {
    console.log(error);
    this.ocrResult = `Webcam initialization error: ${error.message}`;
  }

  async processImage(imageDataUrl: string) {
    this.loading = true;
    try {
      // Step 1: Image Quality Check
      const image = await Jimp.read(imageDataUrl);
      if (!this.isImageQualitySufficient(image)) {
        this.ocrResult =
          "Image quality is too low for reliable decoding. Please provide a clearer image.";
        return;
      }

      // Proceed with existing processing and decoding
      const formatMatch = imageDataUrl.match(/data:image\/(.*?);/);
      const format = formatMatch ? formatMatch[1] : "png";

      // Apply preprocessing transformations
      image.greyscale().contrast(0.5).brightness(0.1).normalize();

      // Resize image while maintaining aspect ratio
      const targetWidth = 2048;
      const aspectRatio = image.bitmap.height / image.bitmap.width;
      const targetHeight = Math.round(targetWidth * aspectRatio);
      image.resize({ w: targetWidth, h: targetHeight });

      // Check Image Dimensions
      // const minDimension = 100; // Minimum acceptable dimension
      // const maxDimension = targetWidth; // Maximum acceptable dimension
      // if (
      //   image.bitmap.width < minDimension ||
      //   image.bitmap.height < minDimension ||
      //   image.bitmap.width > maxDimension ||
      //   image.bitmap.height > maxDimension
      // ) {
      //   this.ocrResult = `Image dimensions (${image.bitmap.width}x${image.bitmap.height}) are outside acceptable limits.`;
      //   return;
      // }

      // Convert processed image to canvas data
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get canvas context");

      const imageData = new ImageData(
        new Uint8ClampedArray(image.bitmap.data),
        targetWidth,
        targetHeight
      );
      ctx.putImageData(imageData, 0, 0);

      const imageUrl = canvas.toDataURL(`image/${format}`);
      const imgElement = document.createElement("img");
      imgElement.src = imageUrl;

      // Decode the Image with BrowserMultiFormatReader
      const result = await this.BrowserReader.decodeFromImage(imgElement);

      if (result) {
        this.ocrResult = result.getText();
        this.parseAAMVA(this.ocrResult);
      } else {
        this.ocrResult = "No valid data found in the barcode.";
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        LogRocket.error("An error occurred,No barcode found.", {
          additionalData: error,
        });
        this.ocrResult =
          "No barcode found. Ensure the image has a clear QR or PDF417 code.";
      } else {
        LogRocket.error("Error processing the image", {
          additionalData: error,
        });
        this.ocrResult = "Error processing the image.";
      }
      console.error("Decoding error:", error);
    } finally {
      this.loading = false;
    }
  }

  // Helper function to check if image quality is sufficient
  isImageQualitySufficient(image: any): boolean {
    const contrast =
      image.bitmap.data.reduce((acc: any, pixel: any, index: any) => {
        if (index % 4 === 0) {
          acc += Math.abs(pixel - 128);
        }
        return acc;
      }, 0) /
      (image.bitmap.width * image.bitmap.height);

    const sharpnessThreshold = 0.3; // Define your sharpness threshold here
    return contrast > sharpnessThreshold;
  }

  onFileSelectedJimp(event: Event): void {
    this.imageChangedEvent = event;
    this.isImageOpenedInCropper = true;
    const file = (event.target as HTMLInputElement).files?.[0];
    try {
      if (file) {
        const objectUrl = URL.createObjectURL(file);
        this.loadedImage = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      }
    } catch (error) {
      this.ocrResult = `File selection failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  }

  private parseAAMVA(data: string): void {
    const regexNameAAMVA = /DAC([^\n]*)/;
    const regexDOBAAMVA = /DBB(\d{8})/;
    const regexLicenseNumberAAMVA = /DAQ([^\n]*)/;

    const regexNameLabel = /Name\s*[:\-\s,]*\s*([^\n]*)/i;
    const regexDOBLabel = /DOB\s*[:\-\s,]*\s*(\d{8})/i;
    const regexLicenseNumberLabel = /License\s*Number\s*[:\-\s,]*\s*([^\n]*)/i;

    let nameMatch = data.match(regexNameAAMVA);
    let dobMatch = data.match(regexDOBAAMVA);
    let licenseNumberMatch = data.match(regexLicenseNumberAAMVA);

    if (!nameMatch) nameMatch = data.match(regexNameLabel);
    if (!dobMatch) dobMatch = data.match(regexDOBLabel);
    if (!licenseNumberMatch)
      licenseNumberMatch = data.match(regexLicenseNumberLabel);

    const name = nameMatch ? nameMatch[1].trim() : "Not found";
    const dob = dobMatch ? dobMatch[1] : "Not found";
    const licenseNumber = licenseNumberMatch
      ? licenseNumberMatch[1].trim()
      : "Not found";

    this.ocrResult = `Name: ${name}, \n DOB: ${dob}, \n License Number: ${licenseNumber}`;
  }

  // functions for image cropper
  imageCropped(event: ImageCroppedEvent): void {
    this.cropEvent = event;
    console.log(" this.cropEvent =>", this.cropEvent);
  }

  cropImage(): void {
    if (this.cropEvent && this.cropEvent.objectUrl) {
      this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(
        this.cropEvent.objectUrl
      );
      // Convert Object URL to File and pass it to uploadAndProcessImage
      this.convertObjectUrlToFile(this.cropEvent.objectUrl, "cropped-image.jpg")
        .then((croppedFile) => {
          this.uploadAndProcessImage(croppedFile);
          this.isImageOpenedInCropper = false;
          // resetting prev selected image
          this.imageChangedEvent = null;
        })
        .catch((error) => {
          this.ocrResult = `Error converting File: `;
          console.error("Error converting Object URL to File:", error);
        });
    }
  }

  imageLoaded(image: LoadedImage): void {
    // this.cropperMinWidth = image.original.size.width / 2;
    // this.cropperMinHeight = image.original.size.height / 2;
  }

  cropperReady(): void {
    // Cropper ready
  }

  loadImageFailed(): void {
    alert("Failed to load the image.");
  }

  convertObjectUrlToFile(objectUrl: string, fileName: string): Promise<File> {
    return new Promise((resolve, reject) => {
      // Create a new image element to fetch the image data
      const img = new Image();
      img.src = objectUrl;

      img.onload = () => {
        // Create a canvas to extract the image data
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Draw the image onto the canvas
          ctx.drawImage(img, 0, 0);

          // Convert the canvas content to a Blob (image data)
          canvas.toBlob((blob) => {
            if (blob) {
              // Create a new File object from the Blob
              const newFile = new File([blob], fileName, { type: blob.type });
              resolve(newFile);
            } else {
              reject("Failed to convert canvas to Blob");
            }
          }, img.src);
        } else {
          reject("Failed to get canvas context");
        }
      };

      img.onerror = (error) => {
        reject(`Error loading image: ${error}`);
      };
    });
  }
}

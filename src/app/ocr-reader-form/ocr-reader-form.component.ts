import {
  BarcodeFormat,
  RGBLuminanceSource,
  HybridBinarizer,
  BinaryBitmap,
  DecodeHintType,
  PDF417Reader,
  MultiFormatReader,
  NotFoundException,
} from "@zxing/library";
import { Component } from "@angular/core";
import { Jimp } from "jimp";
import * as Sentry from "@sentry/angular";

@Component({
  selector: "app-ocr-reader-form",
  standalone: true,
  templateUrl: "./ocr-reader-form.component.html",
  styleUrls: ["./ocr-reader-form.component.css"],
})
export class OcrReaderFormComponent {
  selectedFile: File | null = null;
  ocrResult: string = "";
  loading: boolean = false;
  imageData: string | ArrayBuffer | null = null;
  dlData: string = "";

  // Define hints for decoding, initializing with supported formats.
  hints = new Map();
  formats = [
    BarcodeFormat.PDF_417,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.DATA_MATRIX,
  ];
  reader = new MultiFormatReader();

  constructor() {
    // Add PDF417 and QR code formats to the hints
    this.hints.set(DecodeHintType.POSSIBLE_FORMATS, this.formats);
    this.reader.setHints(this.hints);
  }

  /**
   * Handles file selection from the input.
   * Reads the selected file as a data URL and triggers image processing.
   */

  // onFileSelectedJimp(event: Event) {
  //   const file = (event.target as HTMLInputElement).files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       const imageDataUrl = e.target?.result as string;
  //       this.processImage(imageDataUrl);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  onFileSelectedJimp(event: Event) {
    try {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const imageDataUrl = e.target?.result as string;
          try {
            await this.processImage(imageDataUrl);
          } catch (error) {
            console.error("Image processing failed:", error);
            this.ocrResult = `Image processing failed: ${
              error instanceof Error
                ? error.message
                : "Unknown error Image processing failed"
            }`;
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("File selection failed:", error);
      this.ocrResult = `File selection failed: ${
        error instanceof Error
          ? error.message
          : "Unknown error File selection failed:"
      }`;
    }
  }

  /**
   * Processes the uploaded image using Jimp, extracts luminance,
   * decodes PDF417 barcode, and parses extracted text.
   */
  async processImage(imageDataUrl: string) {
    this.loading = true;
    try {
      const image = await Jimp.read(imageDataUrl);
      const width = image.bitmap.width;
      const height = image.bitmap.height;
      const int32Array = new Int32Array(image.bitmap.data.buffer);
      console.log("width", width);
      console.log("height", height);
      console.log("int32Array", int32Array);

      const luminanceSource = new RGBLuminanceSource(int32Array, width, height);
      const binaryBitmap = new BinaryBitmap(
        new HybridBinarizer(luminanceSource)
      );
      console.log("luminanceSource", luminanceSource);
      console.log("binaryBitmap", binaryBitmap);

      let result = this.reader.decode(binaryBitmap);
      console.log("Result ==>", result);
      if (result) {
        this.parseAAMVA(result.getText());
      } else {
        this.ocrResult = "No valid data found in the barcode.";
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.ocrResult =
          "No barcode found. Ensure the image has a clear QR or PDF417 code.";
      } else {
        Sentry.captureException(error, { tags: { section: "OCR Processing" } });
        this.ocrResult = "Error processing the image.";
      }
      console.error("Decoding error:", error);
    } finally {
      this.loading = false;
    }
  }

  // async processImage(imageDataUrl: string) {
  //   this.loading = true;
  //   try {
  //     // Convert imageDataUrl to binary data to assess its size
  //     const response = await fetch(imageDataUrl);
  //     const blob = await response.blob();
  //     const fileSizeMB = blob.size / (1024 * 1024);

  //     // Check if the file size exceeds 2 MB (adjust as needed)
  //     const maxFileSizeMB = 20;
  //     if (fileSizeMB > maxFileSizeMB) {
  //       // Notify the user if the file is too large
  //       this.ocrResult = `File size is too large (${fileSizeMB.toFixed(
  //         maxFileSizeMB
  //       )} MB). Please use a smaller image.`;
  //       return;
  //     }

  //     // Read image using Jimp and preprocess
  //     let image: any = await Jimp.read(imageDataUrl);

  //     // Set target width for resizing (adjust as needed)
  //     const targetWidth = 1000;
  //     const aspectRatio = image.bitmap.width / image.bitmap.height;
  //     const targetHeight = Math.round(targetWidth / aspectRatio);

  //     // Resize to a standard size if image dimensions are large, to around 1000x1000 or less
  //     if (image.bitmap.width > 1000 || image.bitmap.height > 1000) {
  //       image = image.resize({ w: targetWidth, h: targetHeight });
  //     }

  //     // Enhance brightness, contrast, and convert to grayscale
  //     image = image.brightness(0.1).contrast(0.5).greyscale();

  //     // Rotation handling and decoding
  //     const rotations = [0, 90, 180, 270];
  //     let result;
  //     for (const rotation of rotations) {
  //       if (rotation !== 0) {
  //         image = image.rotate(rotation);
  //       }

  //       const width = image.bitmap.width;
  //       const height = image.bitmap.height;
  //       const int32Array = new Int32Array(image.bitmap.data.buffer);
  //       const luminanceSource = new RGBLuminanceSource(
  //         int32Array,
  //         width,
  //         height
  //       );
  //       const binaryBitmap = new BinaryBitmap(
  //         new HybridBinarizer(luminanceSource)
  //       );

  //       try {
  //         result = this.reader.decode(binaryBitmap);

  //         if (result) break;
  //       } catch (error) {
  //         if (!(error instanceof NotFoundException)) throw error;
  //       }
  //     }
  //     console.log("result ...", result);
  //     if (result) {
  //       this.parseAAMVA(result.getText());
  //     } else {
  //       this.ocrResult = "No valid data found in the barcode.";
  //     }
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       this.ocrResult =
  //         "No barcode found. Ensure the image has a clear QR or PDF417 code.";
  //     } else {
  //       Sentry.captureException(error, { tags: { section: "OCR Processing" } });
  //       this.ocrResult = "Error processing the image.";
  //     }
  //     console.error("Decoding error:", error);
  //   } finally {
  //     this.loading = false;
  //   }
  // }

  /**
   * Parses AAMVA-compliant data from the decoded text.
   * Extracts name, date of birth, and license number using regex patterns.
   */
  private parseAAMVA(data: string): void {
    console.log("extracted data => ", data);

    // Initial Regular expressions for the original AAMVA format
    const regexNameAAMVA = /DAC([^\n]*)/; // AAMVA Name
    const regexDOBAAMVA = /DBB(\d{8})/; // AAMVA Date of birth
    const regexLicenseNumberAAMVA = /DAQ([^\n]*)/; // AAMVA License number

    // Fallback Regular expressions for label-based format with flexible separators
    const regexNameLabel = /Name\s*[:\-\s,]*\s*([^\n]*)/i; // Flexible Name label
    const regexDOBLabel = /DOB\s*[:\-\s,]*\s*(\d{8})/i; // Flexible DOB label
    const regexLicenseNumberLabel = /License\s*Number\s*[:\-\s,]*\s*([^\n]*)/i; // Flexible License number label

    // Attempt to match AAMVA format first
    let nameMatch = data.match(regexNameAAMVA);
    let dobMatch = data.match(regexDOBAAMVA);
    let licenseNumberMatch = data.match(regexLicenseNumberAAMVA);

    // Fallback to label-based format if AAMVA format isn't matched
    if (!nameMatch) nameMatch = data.match(regexNameLabel);
    if (!dobMatch) dobMatch = data.match(regexDOBLabel);
    if (!licenseNumberMatch)
      licenseNumberMatch = data.match(regexLicenseNumberLabel);

    // Extract and format results
    const name = nameMatch ? nameMatch[1].trim() : "Not found";
    const dob = dobMatch ? dobMatch[1] : "Not found";
    const licenseNumber = licenseNumberMatch
      ? licenseNumberMatch[1].trim()
      : "Not found";

    // Append results to ocrResult
    this.ocrResult = `Name: ${name}, \n DOB: ${dob}, \n License Number: ${licenseNumber}`;
  }
}

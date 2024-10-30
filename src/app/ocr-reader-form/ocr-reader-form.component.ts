import {
  BarcodeFormat,
  RGBLuminanceSource,
  HybridBinarizer,
  BinaryBitmap,
  DecodeHintType,
  PDF417Reader,
} from "@zxing/library";
import { Component } from "@angular/core";
import { Jimp } from "jimp";

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
  formats = [BarcodeFormat.PDF_417];
  reader = new PDF417Reader();

  constructor() {
    this.hints.set(DecodeHintType.POSSIBLE_FORMATS, this.formats);
  }

  /**
   * Handles file selection from the input.
   * Reads the selected file as a data URL and triggers image processing.
   */
  onFileSelectedJimp(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        this.processImage(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Processes the uploaded image using Jimp, extracts luminance,
   * decodes PDF417 barcode, and parses extracted text.
   */
  async processImage(imageDataUrl: string) {
    this.loading = true; // Start loading state
    try {
      // Read image with Jimp and extract bitmap properties
      const image = await Jimp.read(imageDataUrl);
      const width = image.bitmap.width;
      const height = image.bitmap.height;
      const int32Array = new Int32Array(image.bitmap.data.buffer);

      // Create RGBLuminanceSource and BinaryBitmap for decoding
      const luminanceSource = new RGBLuminanceSource(int32Array, width, height);
      const binaryBitmap = new BinaryBitmap(
        new HybridBinarizer(luminanceSource)
      );

      // Decode using hints to recognize PDF417 format
      let result = this.reader.decode(binaryBitmap, this.hints);

      if (result) {
        // Parse and display the AAMVA data from the decoded text
        this.parseAAMVA(result.getText());
      } else {
        this.ocrResult = "No valid data found in the barcode.";
      }
    } catch (error) {
      console.error("Error during image processing or decoding:", error);
      this.ocrResult = "Error processing the image.";
    } finally {
      this.loading = false; // End loading state
    }
  }

  /**
   * Parses AAMVA-compliant data from the decoded text.
   * Extracts name, date of birth, and license number using regex patterns.
   */
  private parseAAMVA(data: string): void {
    // Regular expressions for extracting specific fields
    const regexName = /DAC([^\n]*)/; // Name
    const regexDOB = /DBB(\d{8})/; // Date of birth
    const regexLicenseNumber = /DAQ([^\n]*)/; // License number

    // Execute regex and handle potential matches
    const nameMatch = data.match(regexName);
    const dobMatch = data.match(regexDOB);
    const licenseNumberMatch = data.match(regexLicenseNumber);

    // Extract and format results
    const name = nameMatch ? nameMatch[1].trim() : "Not found";
    const dob = dobMatch ? dobMatch[1] : "Not found";
    const licenseNumber = licenseNumberMatch
      ? licenseNumberMatch[1].trim()
      : "Not found";

    // Append results to ocrResult
    this.ocrResult = `Name: ${name}\nDOB: ${dob}\nLicense Number: ${licenseNumber}`;
  }
}

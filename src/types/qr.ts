export type QRDataType =
  | 'text'
  | 'url'
  | 'email'
  | 'phone'
  | 'sms'
  | 'wifi'
  | 'vcard'
  | 'geo'
  | 'event';

export interface QRData {
  type: QRDataType;
}

// Text
export interface TextQRData extends QRData {
  type: 'text';
  content: string;
}

// URL
export interface UrlQRData extends QRData {
  type: 'url';
  url: string;
  protocol: 'http' | 'https';
}

// Email
export interface EmailQRData extends QRData {
  type: 'email';
  email: string;
  subject?: string;
  body?: string;
}

// Phone
export interface PhoneQRData extends QRData {
  type: 'phone';
  phone: string;
  countryCode: string;
}

// SMS
export interface SMSQRData extends QRData {
  type: 'sms';
  phone: string;
  countryCode: string;
  message?: string;
}

// WiFi
export interface WiFiQRData extends QRData {
  type: 'wifi';
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

// vCard
export interface VCardQRData extends QRData {
  type: 'vcard';
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  company?: string;
  address?: string;
  website?: string;
}

// Geo Location
export interface GeoQRData extends QRData {
  type: 'geo';
  latitude: string;
  longitude: string;
}

// Event
export interface EventQRData extends QRData {
  type: 'event';
  title: string;
  start: string;
  end?: string;
  location?: string;
  description?: string;
}

export type AllQRData =
  | TextQRData
  | UrlQRData
  | EmailQRData
  | PhoneQRData
  | SMSQRData
  | WiFiQRData
  | VCardQRData
  | GeoQRData
  | EventQRData;

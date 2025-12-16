import type { AllQRData } from '../types/qr';

export function formatQRData(data: AllQRData): string {
  switch (data.type) {
    case 'text':
      return data.content;

    case 'url':
      return `${data.protocol}://${data.url}`;

    case 'email':
      let emailStr = `mailto:${data.email}`;
      const params = [];
      if (data.subject) {
        params.push(`subject=${encodeURIComponent(data.subject)}`);
      }
      if (data.body) {
        params.push(`body=${encodeURIComponent(data.body)}`);
      }
      if (params.length > 0) {
        emailStr += `?${params.join('&')}`;
      }
      return emailStr;

    case 'phone':
      return `tel:${data.countryCode}${data.phone}`;

    case 'sms':
      let smsStr = `sms:${data.countryCode}${data.phone}`;
      if (data.message) {
        smsStr += `?body=${encodeURIComponent(data.message)}`;
      }
      return smsStr;

    case 'wifi':
      let wifiStr = 'WIFI:';
      wifiStr += `T:${data.encryption}`;
      wifiStr += `;S:${data.ssid}`;
      if (data.encryption !== 'nopass') {
        wifiStr += `;P:${data.password}`;
      }
      if (data.hidden) {
        wifiStr += ';H:true';
      }
      wifiStr += ';;';
      return wifiStr;

    case 'vcard':
      return formatVCard(data);

    case 'geo':
      return `geo:${data.latitude},${data.longitude}`;

    case 'event':
      return formatEvent(data);

    default:
      return '';
  }
}

function escapeICalText(value: string): string {
  const normalized = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return normalized
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

function formatICalDateTime(dateStr: string): string {
  const trimmed = dateStr.trim();
  if (!trimmed) {
    return '';
  }

  if (/[zZ]$/.test(trimmed) || /[+-]\d{2}:\d{2}$/.test(trimmed)) {
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!match) {
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  const [, y, m, d, hh = '00', mm = '00', ss = '00'] = match;
  return `${y}${m}${d}T${hh}${mm}${ss}`;
}

function formatVCard(data: AllQRData & { type: 'vcard' }): string {
  let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
  vcard += `FN:${data.firstName} ${data.lastName}\n`;
  vcard += `N:${data.lastName};${data.firstName};;;\n`;

  if (data.phone) {
    vcard += `TEL:${data.phone}\n`;
  }
  if (data.email) {
    vcard += `EMAIL:${data.email}\n`;
  }
  if (data.company) {
    vcard += `ORG:${data.company}\n`;
  }
  if (data.address) {
    vcard += `ADR:;;${data.address};;;;\n`;
  }
  if (data.website) {
    vcard += `URL:${data.website}\n`;
  }

  vcard += 'END:VCARD';
  return vcard;
}

function formatEvent(data: AllQRData & { type: 'event' }): string {
  const eol = '\r\n';
  let eventStr = `BEGIN:VEVENT${eol}`;
  eventStr += `SUMMARY:${escapeICalText(data.title)}${eol}`;

  // Format dates for iCalendar
  eventStr += `DTSTART:${formatICalDateTime(data.start)}${eol}`;
  if (data.end?.trim()) {
    eventStr += `DTEND:${formatICalDateTime(data.end)}${eol}`;
  }
  if (data.location?.trim()) {
    eventStr += `LOCATION:${escapeICalText(data.location)}${eol}`;
  }
  if (data.description?.trim()) {
    eventStr += `DESCRIPTION:${escapeICalText(data.description)}${eol}`;
  }

  eventStr += `END:VEVENT${eol}`;

  return `BEGIN:VCALENDAR${eol}VERSION:2.0${eol}PRODID:-//QRGen//QR Generator//EN${eol}${eventStr}END:VCALENDAR`;
}

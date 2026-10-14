import { CONTACT } from '../data/site.js'

export default function FloatingContact() {
  return (
    <div className="vg-floating-contact">
      <a
        href={CONTACT.zalo}
        target="_blank"
        rel="noopener noreferrer"
        className="vg-float-btn vg-float-zalo"
        aria-label="Chat Zalo"
      >
        <svg viewBox="0 0 48 48" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#ffffff"
            d="M24 4C12.95 4 4 12.06 4 22c0 5.7 2.94 10.78 7.53 14.06.37.26.6.7.6 1.18v3.9c0 .8.86 1.3 1.55.9l4.55-2.63c.33-.19.72-.26 1.09-.19 1.53.29 3.12.44 4.68.44 11.05 0 20-8.06 20-18S35.05 4 24 4Z"
          />
          <path
            fill="#0068ff"
            d="M15.6 26.9h5.98a.8.8 0 0 0 0-1.6h-3.66l3.9-5.02a.9.9 0 0 0-.71-1.45h-5.5a.8.8 0 0 0 0 1.6h3.36l-3.9 5.02a.9.9 0 0 0 .53 1.45Zm8.9-8.07a.8.8 0 0 0-.8.8v6.47a.8.8 0 0 0 1.6 0v-6.47a.8.8 0 0 0-.8-.8Zm3.1.03a.8.8 0 0 0-.8.8v6.4a.8.8 0 0 0 1.55.27l.3-.83c.5.55 1.22.9 2.05.9 1.6 0 2.8-1.4 2.8-3.3s-1.2-3.3-2.8-3.3c-.6 0-1.15.19-1.6.53v-.67a.8.8 0 0 0-.8-.8h-.7Zm2.1 5.7c-.75 0-1.25-.68-1.25-1.66 0-.98.5-1.66 1.25-1.66s1.25.68 1.25 1.66c0 .98-.5 1.66-1.25 1.66Z"
          />
        </svg>
      </a>
      <a
        href={CONTACT.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="vg-float-btn vg-float-facebook"
        aria-label="Facebook VietGen"
      >
        <i className="fa fa-facebook" />
      </a>
      <a
        href={CONTACT.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="vg-float-btn vg-float-whatsapp"
        aria-label="Chat WhatsApp"
      >
        <i className="fa fa-whatsapp" />
      </a>
    </div>
  )
}

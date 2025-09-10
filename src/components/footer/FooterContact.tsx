import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

interface FooterContactProps {
  whatsappNumber: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
}

export const FooterContact: React.FC<FooterContactProps> = ({
  whatsappNumber,
  contactPhone,
  contactEmail,
  address
}) => {
  const contactItems = [
    {
      icon: Phone,
      text: `+${whatsappNumber}`,
      href: `https://wa.me/${whatsappNumber}`,
      label: 'WhatsApp'
    },
    ...(contactPhone ? [{
      icon: Phone,
      text: contactPhone,
      href: `tel:${contactPhone}`,
      label: 'Phone'
    }] : []),
    {
      icon: Mail,
      text: contactEmail,
      href: `mailto:${contactEmail}`,
      label: 'Email'
    },
    {
      icon: MapPin,
      text: address,
      href: null,
      label: 'Address'
    }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
        Kontak
      </h3>
      <ul className="space-y-3">
        {contactItems.map((item, index) => {
          const IconComponent = item.icon;
          const content = (
            <div className="flex items-center space-x-3 text-gray-300 group-hover:text-pink-300 transition-colors duration-300">
              <div className="p-1.5 rounded-lg bg-gray-800/50 group-hover:bg-pink-500/10 transition-colors duration-300">
                <IconComponent size={16} className="text-pink-400" />
              </div>
              <span className="text-sm">{item.text}</span>
            </div>
          );

          return (
            <li key={index}>
              {item.href ? (
                <a 
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                  className="group block hover:bg-gray-800/30 rounded-lg p-2 -m-2 transition-all duration-300"
                  aria-label={item.label}
                >
                  {content}
                </a>
              ) : (
                <div className="group p-2 -m-2">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

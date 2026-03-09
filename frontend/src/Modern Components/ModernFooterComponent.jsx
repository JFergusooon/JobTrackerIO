import React from 'react';
import { Mail, Phone, MapPin, Github, Linkedin } from 'lucide-react';

export default function ModernFooter() {
  const contactInfo = {
    address: {
      line1: "Ferguson Software Solutions",
      line2: "Salt Lake City, UT",
      line3: "United States"
    },
    phone: "385-499-1578",
    email: "jfergusooon@gmail.com"
  };

  const socialLinks = [
    { icon: Github, url: "https://github.com/jfergusooon", label: "GitHub" },
    { icon: Linkedin, url: "https://www.linkedin.com/in/jeffrey-ferguson-dev/", label: "LinkedIn" }
  ];

  return (
    <footer className="bg-gray-700 border-t-8 border-gray-900">
      {/* Main Footer Content */}
      <div className="bg-gradient-to-br from-slate-400 to-slate-500 py-3 px-4 items-center text-center md:text-left">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center"
                style={{ padding: '0px', borderRadius: '20px', height: '220px' }}>
            
            <div className="p-3" style={{display: 'flex', flexDirection: 'row', gap: '100px', marginRight: '10%'}}>
              <div>
                <h3 className="text-3xl font-bold text-white mb-1 text-left border-b-4 border-orange-600 pb-2">
                  Contact Information
                </h3>
                <div className="space-y-2">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="text-orange-500 mt-1 flex-shrink-0" size={24} />
                  <div>
                    <p className="text-white font-semibold">Address:</p>
                    <p className="text-gray-300">{contactInfo.address.line1}</p>
                    <p className="text-gray-300">{contactInfo.address.line2}</p>
                    <p className="text-gray-300">{contactInfo.address.line3}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <Phone className="text-orange-500 flex-shrink-0" size={24} />
                  <div>
                    <p className="text-white font-semibold inline">Phone: </p>
                    <a href={`tel:${contactInfo.phone}`} className="text-orange-300 hover:text-orange-200">
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <Mail className="text-orange-500 flex-shrink-0" size={24} />
                  <div>
                    <p className="text-white font-semibold inline">Email: </p>
                    <a href={`mailto:${contactInfo.email}`} className="text-orange-300 hover:text-orange-200 break-all">
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
              </div>
              </div>
              
              <div className="flex items-center justify-center">
                <img
                  src="/images/CompanyLogo.png"
                  alt="Footer Illustration"
                  className="rounded-3xl"
                  style={{width: '200px', height: '200px', objectFit: 'cover'}}
                />
              </div>
              
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="bg-gray-900 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
          {/* Copyright */}
          <div className="text-gray-400 text-sm text-center md:text-left">
            © {new Date().getFullYear()} Jeffrey Ferguson - <a href="/" className="text-orange-400 hover:text-orange-300">Terms of Service</a>
          </div>

          {/* Social Media Links */}
          <div className="flex gap-4">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="bg-gray-700 hover:bg-orange-600 text-gray-300 hover:text-white p-3 rounded-full transition-all transform hover:scale-110"
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
import React from "react";

import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"; // Import Lucide icons
import { Link } from "react-router-dom";
import { Container } from "@/components/container";
import { MainRoutes } from "@/lib/helpers";

interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
  hoverColor: string;
}

const SocialLink: React.FC<SocialLinkProps> = ({ href, icon, hoverColor }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`transition-colors ${hoverColor}`}
    >
      {icon}
    </a>
  );
};

interface FooterLinkProps {
  to: string;
  children: React.ReactNode;
}

const FooterLink: React.FC<FooterLinkProps> = ({ to, children }) => {
  return (
    <li>
      <Link
        to={to}
        className="hover:underline text-gray-300 hover:text-gray-100"
      >
        {children}
      </Link>
    </li>
  );
};

export const Footer = () => {
  return (
    <footer className="w-full bg-black text-gray-300 py-8">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* First Column: Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {MainRoutes.map((route) => (
                <FooterLink key={route.href} to={route.href}>
                  {route.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Second Column: About Us */}
          <div>
            <h3 className="font-bold text-lg mb-4">About Us</h3>
            <p>
              We are committed to helping you unlock your full potential with
              AI-powered tools. Our platform offers a wide range of resources to
              improve your interview skills and chances of success.
            </p>
          </div>

          {/* Third Column: Services */}
          <div>
            <h3 className="font-bold text-lg mb-4">Services</h3>
            <ul>
              <FooterLink to="/services#question-generation">
                Question Generation
              </FooterLink>
              <FooterLink to="/services#practice-sessions">
                Practice Sessions
              </FooterLink>
              <FooterLink to="/services#ai-feedback">
                AI Scoring &amp; Feedback
              </FooterLink>
            </ul>
          </div>

          {/* Fourth Column: Address and Social Media */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <p className="mb-4">
              Questions or feedback?{" "}
              <Link to="/contact" className="underline hover:text-gray-100">
                Send us a message
              </Link>
              .
            </p>
            <div className="flex gap-4">
              <SocialLink
                href="https://facebook.com"
                icon={<Facebook size={24} />}
                hoverColor="hover:text-blue-500"
              />
              <SocialLink
                href="https://twitter.com"
                icon={<Twitter size={24} />}
                hoverColor="hover:text-blue-400"
              />
              <SocialLink
                href="https://instagram.com"
                icon={<Instagram size={24} />}
                hoverColor="hover:text-pink-500"
              />
              <SocialLink
                href="https://linkedin.com"
                icon={<Linkedin size={24} />}
                hoverColor="hover:text-blue-700"
              />
            </div>
          </div>
        </div>
        <p className="mt-8 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Interviewly. All rights reserved.
        </p>
      </Container>
    </footer>
  );
};
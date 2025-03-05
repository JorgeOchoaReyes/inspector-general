import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react"; 
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">NZQR</h2>
            <p className="text-slate-400 max-w-xs">
                Tools for the modern developer.
            </p>
            <div className="flex items-center space-x-2 text-slate-400">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">SF, CA</span>
            </div> 
            <div className="flex items-center space-x-2 text-slate-400">
              <Mail className="h-4 w-4" />
              <span className="text-sm">jorgeochoareyes@gmail.com</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Quick Links</h2>
            <ul className="space-y-2">
              {["Home", "About", "Services", "Portfolio", "Blog", "Contact"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Our Services</h2>
            <ul className="space-y-2">
              {[
                "Web Development",
                "Mobile Apps",
                "UI/UX Design",
                "Digital Marketing",
                "SEO Optimization",
                "Cloud Solutions",
              ].map((service) => (
                <li key={service}>
                  <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Subscribe</h2>
            <p className="text-slate-400">Subscribe to our newsletter for the latest updates.</p>
            <div className="flex flex-col space-y-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
              <Button className="w-full">Subscribe</Button>
            </div>
            <div className="flex space-x-4 pt-2">
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-slate-700" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Company Name. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


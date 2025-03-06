import Link from "next/link";
import { GithubIcon, Instagram, Linkedin, Mail, MapPin, } from "lucide-react";  
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
              {[ "Home", "Dashboard", "Login", "Contact" ].map((item) => {
                let link = "#";
                switch(item) {
                  case "Contact":
                    link = "mailto:jorgeochoareyes@gmailcom";
                    break;
                  case "Login":
                    link = "/login";
                    break;
                  case "Dashboard":
                    link = "/dashboard";
                    break;
                  case "Home":
                    link = "/";
                    break;
                }
                return <li key={item}>
                  <Link href={link} className="text-slate-400 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>;
              })}
            </ul>
          </div> 

          {/* Newsletter */}
          <div className="space-y-4"> 
            <h2 className="text-xl font-bold">Social Media</h2>
            <div className="flex space-x-4 pt-2"> 
              <Link href="https://github.com/JorgeOchoaReyes/inspector-general" className="text-slate-400 hover:text-white transition-colors">
                <GithubIcon className="h-5 w-5" />
                <span className="sr-only">Github</span>
              </Link>
              <Link href="https://www.linkedin.com/in/jorge-ochoa-reyes-70087b223/" className="text-slate-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="https://www.instagram.com/jorgeochoareyes/" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-slate-700" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} NZQR. All rights reserved.</p>
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


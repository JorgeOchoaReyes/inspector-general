import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"; 
import React from "react";

export const Modal: React.FC<{
  children: React.ReactNode; 
  open?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  button_label?: string;
  button_variant?: string;
  title?: string;
  description?: string;
  buttonNodes?: React.ReactNode[];
}> = ({
  children, 
  open,
  onClose,
  onOpen,
  button_label,
  button_variant="default",
  title,
  description,
  buttonNodes,
}) => {
  return (
    <Dialog open={open} onOpenChange={(open) => {
      if(open === false && onClose) {
        onClose();
      }
    }}> 
      <DialogTrigger asChild onClick={onOpen}>
        <Button variant={button_variant as "outline" | "link" | "default" | "destructive" | "secondary" | "ghost" | null | undefined}>{button_label}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {children}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {
            buttonNodes?.map((button, index) => {
              return (
                <React.Fragment key={index}>
                  {button}
                </React.Fragment>
              );
            })
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

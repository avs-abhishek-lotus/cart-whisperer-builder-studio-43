
import React from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CartProvider } from "@/context/CartContext";
import Navigation from "@/components/Navigation";
import CartDrawer from "@/components/CartDrawer";
import ChatInterface from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Mail, User, Phone, MessageSquare, Send, Gift, Star } from "lucide-react";

// Define the form schema
const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be less than 50 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z
    .string()
    .min(7, { message: "Phone number must be at least 7 digits" })
    .optional(),
  interest: z.string({
    required_error: "Please select what you're interested in",
  }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(500, { message: "Message must be less than 500 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

const ContactForm = () => {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      interest: "",
      message: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted:", data);
    
    // Show success toast
    toast({
      title: "Contact request submitted!",
      description: "We'll be in touch with you shortly. Your free AI assistant will be set up within 24 hours!",
    });
    
    // Reset form
    form.reset();
    
    // Redirect to homepage after 2 seconds
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main className="flex-grow py-8 px-4 container">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold mb-4 text-cart-dark">Get In Touch</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions about our products or services? We'd love to hear from you!
            </p>
          </div>
          
          {/* Incentive Banner */}
          <div className="max-w-5xl mx-auto mb-8 bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-lg border border-purple-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-full">
                <Gift className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-purple-700 flex items-center gap-2">
                  Special Offer <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                </h2>
                <p className="text-purple-800 font-medium">
                  Get Free AI Assistant Services Customized for You for a Month!
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  Complete this form to unlock your personalized AI assistant that will help streamline your workflow.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-lg shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Why Contact Us?</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Special Promotions</h3>
                      <p className="text-muted-foreground">Get access to exclusive deals and early-bird sales</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Product Inquiries</h3>
                      <p className="text-muted-foreground">Have specific questions about our products?</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3 mt-1">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Customer Support</h3>
                      <p className="text-muted-foreground">Our team is ready to assist with any issues</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="mt-8 p-4 bg-white/50 rounded-md border border-blue-100">
                <h3 className="font-medium mb-2 text-blue-700">Customer Satisfaction Guarantee</h3>
                <p className="text-sm text-muted-foreground">
                  We pride ourselves on providing exceptional service. If you're not completely satisfied, 
                  let us know and we'll make it right.
                </p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">Contact Form</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="John Smith" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="you@example.com" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="+1 (555) 000-0000" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          We'll only call if we have important updates about your inquiry.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="interest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What are you interested in?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="product_inquiry">Product Inquiry</SelectItem>
                            <SelectItem value="bulk_order">Bulk Order</SelectItem>
                            <SelectItem value="support">Customer Support</SelectItem>
                            <SelectItem value="partnership">Business Partnership</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Message</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Textarea 
                              className="min-h-24 pl-10" 
                              placeholder="Please tell us how we can help you..." 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Submit Request & Get Free AI Assistant
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </main>
        
        <CartDrawer />
        <ChatInterface />
      </div>
    </CartProvider>
  );
};

export default ContactForm;

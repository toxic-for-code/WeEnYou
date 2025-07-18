"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const defaultAmenities = [
  "WiFi",
  "Parking",
  "Air Conditioning",
  "Projector",
  "Sound System",
  "Catering",
  "Stage",
  "Lighting",
];

const steps = [
  "Venue Details",
  "Location",
  "Pricing",
  "Amenities",
  "Photos",
  "Review & Submit"
];

export default function ListYourHallPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    price: "",
    capacity: "",
    amenities: [] as string[],
    images: [] as string[],
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<{pincode?: string, price?: string, capacity?: string}>({});
  const [dragActive, setDragActive] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newHallId, setNewHallId] = useState<string | null>(null);
  const [helpPhone, setHelpPhone] = useState("");
  const [helpMessage, setHelpMessage] = useState("");
  const [helpSubmitted, setHelpSubmitted] = useState(false);
  const [amenitiesList, setAmenitiesList] = useState<string[]>(defaultAmenities);
  const [newAmenity, setNewAmenity] = useState("");

  if (status === "loading") {
    return <div className="text-center py-12">Loading...</div>;
  }
  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-700">You must be signed in to list a hall.</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({
        ...prev,
        amenities: checked
          ? [...prev.amenities, value]
          : prev.amenities.filter((a) => a !== value),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      // Live validation
      if (name === "pincode") {
        if (!/^[0-9]{6}$/.test(value)) {
          setValidationErrors((prev) => ({ ...prev, pincode: "Pincode must be a 6-digit number." }));
        } else {
          setValidationErrors((prev) => ({ ...prev, pincode: undefined }));
        }
      }
      if (name === "price") {
        if (Number(value) < 500) {
          setValidationErrors((prev) => ({ ...prev, price: "Price should be at least ₹500." }));
        } else {
          setValidationErrors((prev) => ({ ...prev, price: undefined }));
        }
      }
      if (name === "capacity") {
        if (Number(value) < 50) {
          setValidationErrors((prev) => ({ ...prev, capacity: "Capacity should be at least 50 guests." }));
        } else {
          setValidationErrors((prev) => ({ ...prev, capacity: undefined }));
        }
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let files: File[] = [];
    if ('dataTransfer' in e) {
      files = Array.from(e.dataTransfer.files);
    } else if (e.target.files) {
      files = Array.from(e.target.files);
    }
    setImageFiles(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleImageChange(e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Custom validation
    if (!form.name.trim() || !form.description.trim() || !form.address.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim() || !form.price || !form.capacity) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append("files", file));
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Image upload failed");
        imageUrls = data.urls;
      }

      const requestData = {
        ...form,
        price: Number(form.price),
        capacity: Number(form.capacity),
        images: imageUrls,
      };

      const response = await fetch("/api/halls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to list hall");
      }

      setNewHallId(data.hall._id);
      setShowSuccess(true);
      // router.push(`/halls/${data.hall._id}`); // Now handled by modal
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-sm fixed top-0 left-0 z-40">
        <div className="text-xl font-bold text-blue-900">WeEnYou</div>
        <Link href="/profile/owner" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-full transition shadow">
          Profile
        </Link>
      </nav>
      <div className="pt-20"> {/* Add padding to offset fixed navbar */}
      {/* Hero Section */}
      <div className="relative h-64 w-full flex items-center justify-center mb-8">
        <img src="/public/photography.png" alt="List Your Hall" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 drop-shadow mb-2 animate-fade-in">List Your Hall on WeEnYou</h1>
          <p className="text-lg md:text-xl text-blue-800 font-medium animate-fade-in">Reach more customers, manage bookings easily, and grow your business!</p>
        </div>
      </div>
      {/* Trust Badge/Testimonial */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-full shadow px-6 py-2 flex items-center gap-2 border border-blue-100 animate-fade-in">
          <span className="text-blue-900 font-semibold">Trusted by 500+ venues across India</span>
        </div>
      </div>
      {/* Why List Section */}
      <div className="bg-blue-100 border border-blue-200 rounded-lg p-6 mb-10 max-w-2xl mx-auto animate-fade-in">
        <h2 className="text-2xl font-bold mb-2 text-blue-900">Why list with WeEnYou?</h2>
        <ul className="list-disc pl-6 text-blue-800 text-base space-y-1">
          <li>Reach thousands of event planners and customers</li>
          <li>Easy management of bookings and payments</li>
          <li>Dedicated support for hall owners</li>
          <li>Showcase your venue with beautiful photos</li>
        </ul>
      </div>
      {/* Progress Bar / Step Indicator */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, idx) => (
            <div key={step} className="flex-1 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${idx <= currentStep ? 'bg-blue-600' : 'bg-blue-200'}`}>{idx + 1}</div>
              <span className={`text-xs mt-1 ${idx === currentStep ? 'text-blue-700 font-semibold' : 'text-gray-500'}`}>{step}</span>
            </div>
          ))}
        </div>
        <div className="h-2 w-full bg-blue-100 rounded-full relative">
          <div
            className="h-2 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
      {/* Form Card with Step Sections */}
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-4 sm:p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto animate-fade-in transition-all duration-300">
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-2">{error}</div>}
        {/* Step 1: Venue Details */}
        {currentStep === 0 && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">Venue Details</h3>
            <div className="mb-3">
              <label className="block font-medium mb-1">What's the name of your hall?</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 transition-shadow focus:shadow-lg focus:ring-2 focus:ring-blue-200"
                placeholder="e.g. Grand Celebration Hall"
              />
              <p className="text-xs text-gray-500 mt-1">This is how your hall will appear to customers.</p>
            </div>
            <div className="mb-3">
              <label className="block font-medium mb-1">Describe your venue. What makes it special?</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 transition-shadow focus:shadow-lg focus:ring-2 focus:ring-blue-200"
                rows={3}
                placeholder="Share details about your space, ambiance, and unique features."
              />
              <p className="text-xs text-gray-500 mt-1">Highlight what sets your hall apart!</p>
            </div>
          </div>
        )}
        {/* Step 2: Location */}
        {currentStep === 1 && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">Location</h3>
            <div className="mb-3">
              <label className="block font-medium mb-1">Where is your hall located?</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 transition-shadow focus:shadow-lg focus:ring-2 focus:ring-blue-200"
                placeholder="e.g. 123 Main Street, Near City Center"
              />
              <p className="text-xs text-gray-500 mt-1">Please provide the full address for easy discovery.</p>
            </div>
            <div className="flex gap-4 mb-3">
              <div className="flex-1">
                <label className="block font-medium mb-1">Which city is your hall in?</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2 transition-shadow focus:shadow-lg focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. Mumbai"
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">And the state?</label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2 transition-shadow focus:shadow-lg focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. Maharashtra"
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1 flex items-center gap-1">
                  Pincode
                  <span title="Enter a 6-digit area pincode for accurate location." className="text-blue-500 cursor-help">&#9432;</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                  className={`w-full border rounded px-3 py-2 transition-shadow focus:shadow-lg focus:ring-2 focus:ring-blue-200 ${validationErrors.pincode ? 'border-red-400' : ''}`}
                  placeholder="e.g. 400001"
                  pattern="[0-9]{6}"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">Enter the area pincode for accurate location.</p>
                {validationErrors.pincode && <p className="text-xs text-red-500 mt-1">{validationErrors.pincode}</p>}
              </div>
            </div>
          </div>
        )}
        {/* Step 3: Pricing */}
        {currentStep === 2 && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">Pricing & Capacity</h3>
            <div className="flex gap-4 mb-3">
              <div className="flex-1">
                <label className="block font-medium mb-1 flex items-center gap-1">
                  How much do you charge per day?
                  <span title="Minimum price is ₹500 per day." className="text-blue-500 cursor-help">&#9432;</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min={0}
                  className={`w-full border rounded px-3 py-2 transition-shadow focus:shadow-lg focus:ring-2 focus:ring-blue-200 ${validationErrors.price ? 'border-red-400' : ''}`}
                  placeholder="e.g. 25000"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the price in INR.</p>
                {validationErrors.price && <p className="text-xs text-red-500 mt-1">{validationErrors.price}</p>}
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">How many guests can your hall accommodate?</label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  required
                  min={50}
                  className="w-full border rounded px-3 py-2 transition-shadow focus:shadow-lg focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. 300"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum number of guests your hall can host.</p>
                {validationErrors.capacity && <p className="text-xs text-red-500 mt-1">{validationErrors.capacity}</p>}
              </div>
            </div>
          </div>
        )}
        {/* Step 4: Amenities */}
        {currentStep === 3 && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">Amenities</h3>
            <label className="block font-medium mb-1">What amenities do you offer? <span className="font-normal">(Select all that apply)</span></label>
            <div className="flex flex-wrap gap-3 mt-2">
              {amenitiesList.map((amenity) => (
                <label key={amenity} className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-1 rounded cursor-pointer transition-transform hover:scale-105">
                  <input
                    type="checkbox"
                    name="amenities"
                    value={amenity}
                    checked={form.amenities.includes(amenity)}
                    onChange={handleChange}
                    className="accent-blue-600"
                  />
                  {amenity}
                </label>
              ))}
            </div>
            {/* Add Custom Amenity */}
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                value={newAmenity}
                onChange={e => setNewAmenity(e.target.value)}
                className="border rounded px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-200"
                placeholder="Add custom amenity..."
                maxLength={32}
              />
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition"
                disabled={!newAmenity.trim() || amenitiesList.includes(newAmenity.trim())}
                onClick={() => {
                  const trimmed = newAmenity.trim();
                  if (trimmed && !amenitiesList.includes(trimmed)) {
                    setAmenitiesList(prev => [...prev, trimmed]);
                    setForm(prev => ({ ...prev, amenities: [...prev.amenities, trimmed] }));
                    setNewAmenity("");
                  }
                }}
              >
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Amenities help your listing stand out.</p>
          </div>
        )}
        {/* Step 5: Photos */}
        {currentStep === 4 && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">Photos</h3>
            <label className="block font-medium mb-1">Upload some photos to attract more bookings!</label>
            <div
              className={`w-full border-2 ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200'} border-dashed rounded-lg px-3 py-8 text-center transition-all mb-4`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload-input"
              />
              <label htmlFor="image-upload-input" className="cursor-pointer text-blue-600 font-semibold">
                Click to select images or drag and drop here
              </label>
              <p className="text-xs text-gray-500 mt-2">High-quality images get more attention from customers.</p>
            </div>
            {/* Image Previews */}
            {imageFiles.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-2">
                {imageFiles.map((file, idx) => {
                  const url = URL.createObjectURL(file);
                  return (
                    <div key={idx} className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative">
                      <img src={url} alt={`Preview ${idx + 1}`} className="object-cover w-full h-full" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {/* Step 6: Review & Submit */}
        {currentStep === 5 && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">Review & Submit</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold mb-2">Please review your details:</h4>
              <ul className="text-blue-900 text-sm space-y-1">
                <li><b>Name:</b> {form.name}</li>
                <li><b>Description:</b> {form.description}</li>
                <li><b>Address:</b> {form.address}</li>
                <li><b>City:</b> {form.city}</li>
                <li><b>State:</b> {form.state}</li>
                <li><b>Pincode:</b> {form.pincode}</li>
                <li><b>Price:</b> ₹{form.price}</li>
                <li><b>Capacity:</b> {form.capacity}</li>
                <li><b>Amenities:</b> {form.amenities.join(', ')}</li>
                <li><b>Images:</b> {imageFiles.length} selected</li>
              </ul>
            </div>
          </div>
        )}
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 gap-2 flex-col sm:flex-row">
          <button
            type="button"
            className="px-6 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 focus:ring-2 focus:ring-blue-200 transition-all w-full sm:w-auto mb-2 sm:mb-0"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            Back
          </button>
          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 transition-all w-full sm:w-auto"
              onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-semibold shadow-lg text-lg transition-transform hover:scale-105 focus:ring-2 focus:ring-blue-300 w-full sm:w-auto"
            >
              {loading ? "Submitting..." : "Submit your hall and start getting bookings!"}
            </button>
          )}
        </div>
      </form>
      {/* Floating Need Help Button */}
      <button
        type="button"
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all text-lg focus:ring-2 focus:ring-blue-300"
        onClick={() => setShowHelp(true)}
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
      >
        Need Help?
      </button>
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in transition-all">
          <div className="bg-white rounded-xl shadow-xl p-4 sm:p-8 max-w-sm w-[90vw] text-center relative animate-fade-in transition-all">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => { setShowHelp(false); setHelpSubmitted(false); setHelpPhone(""); setHelpMessage(""); }}
              aria-label="Close help modal"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-2 text-blue-800">Need Help?</h2>
            <p className="mb-2 text-gray-700">If you have any questions or need assistance, our support team is here for you.</p>
            <div className="mb-4">
              <span className="block text-gray-700 font-semibold">Call us:</span>
              <a href="tel:+919999999999" className="text-blue-600 underline font-semibold">+91 99999 99999</a>
            </div>
            {!helpSubmitted ? (
              <form
                className="space-y-4 text-left"
                onSubmit={e => { e.preventDefault(); setHelpSubmitted(true); }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Phone Number</label>
                  <input
                    type="tel"
                    value={helpPhone}
                    onChange={e => setHelpPhone(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
                    placeholder="e.g. +91 9876543210"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">What kind of help do you need?</label>
                  <textarea
                    value={helpMessage}
                    onChange={e => setHelpMessage(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
                    placeholder="Describe your issue or question..."
                    rows={3}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  Submit
                </button>
              </form>
            ) : (
              <div className="py-6">
                <h3 className="text-green-600 font-bold text-lg mb-2">Thank you!</h3>
                <p className="text-gray-700">Our support team will contact you soon at your provided number.</p>
              </div>
            )}
            <div className="mt-4">
              <span className="block text-gray-700 font-semibold">Or email:</span>
              <a href="mailto:support@weenyou.com" className="text-blue-600 underline font-semibold break-all">support@weenyou.com</a>
            </div>
          </div>
        </div>
      )}
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in transition-all">
          <div className="bg-white rounded-xl shadow-xl p-4 sm:p-8 max-w-sm w-[90vw] text-center relative animate-fade-in transition-all">
            <div className="flex flex-col items-center justify-center mb-4">
              <svg className="w-16 h-16 text-blue-500 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-blue-700">Your hall is under review</h2>
            <p className="mb-4 text-gray-700">Our team will verify your submission before it goes live. You will be notified once your hall is approved and listed.</p>
            <div className="flex justify-center">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition"
                onClick={() => { setShowSuccess(false); router.push('/profile/owner'); }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
} 
 
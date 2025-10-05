"use client";

import { useState, useEffect, FormEvent, FC } from "react";
import { CheckCircle, AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../../context/AuthContext";

type ProfileData = {
  fullName: string;
  professionalTitle: string;
  barNumber: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  courtPreferences: string;
  signatureBlock: string;
};

type FormFieldConfig = {
  name: keyof ProfileData;
  label: string;
  type: "text" | "email" | "tel" | "textarea";
  placeholder: string;
  rows?: number;
};

const formFields: FormFieldConfig[] = [
  {
    name: "fullName",
    label: "Full Name",
    type: "text",
    placeholder: "John Doe",
  },
  {
    name: "professionalTitle",
    label: "Professional Title",
    type: "text",
    placeholder: "Advocate / Law Student",
  },
  {
    name: "barNumber",
    label: "Bar Council / Enrollment No.",
    type: "text",
    placeholder: "ABC/1234/2024",
  },
  {
    name: "companyName",
    label: "Law Firm / Organization",
    type: "text",
    placeholder: "Lexx Legal Services",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "tel",
    placeholder: "+91 9876543210",
  },
  {
    name: "address",
    label: "Office Address",
    type: "textarea",
    placeholder: "123 Legal Street, City, State",
    rows: 3,
  },
  {
    name: "courtPreferences",
    label: "Preferred Courts",
    type: "textarea",
    placeholder: "High Court of Delhi, Supreme Court of India",
    rows: 2,
  },
  {
    name: "signatureBlock",
    label: "Signature Block",
    type: "textarea",
    placeholder: "Your Name\nAdvocate\nEnrolment No.\nContact Details",
    rows: 3,
  },
];

const InputField: FC<{
  config: FormFieldConfig;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}> = ({ config, value, onChange }) => {
  const { name, label, type, placeholder, rows } = config;

  const commonProps = {
  id: name,
  name: name,
  value: value,
  onChange: onChange,
  placeholder: placeholder,
  className: `
    mt-1 block w-full rounded-md border p-2.5 shadow-sm transition
    bg-zinc-50 text-zinc-900 border-zinc-300
    placeholder:text-zinc-400
    focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50

    dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700
    dark:placeholder:text-zinc-500 dark:focus:border-red-500 dark:focus:ring-red-600
  `,
};

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-stone-300"
      >
        {label}
      </label>
      {type === "textarea" ? (
        <textarea {...commonProps} rows={rows}></textarea>
      ) : (
        <input {...commonProps} type={type} />
      )}
    </div>
  );
};

export default function Profile() {
  const auth = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [profile, setProfile] = useState<ProfileData>({
    fullName: "",
    professionalTitle: "",
    barNumber: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    courtPreferences: "",
    signatureBlock: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Load profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // assuming auth token
        const res = await fetch(`${API_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        console.log("profile : ", data);

        setProfile((prev) => ({
          ...prev,
          ...Object.fromEntries(
            Object.keys(prev).map((key) => [key, data[key] ?? ""])
          ),
        }));

        // also store in localStorage as backup
        localStorage.setItem("userProfile", JSON.stringify(data));
      } catch {
        // fallback: try localStorage
        const saved = localStorage.getItem("userProfile");
        if (saved) {
          setProfile(JSON.parse(saved));
        } else {
          setNotification({
            message: "Could not load profile data.",
            type: "error",
          });
        }
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/user/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      setNotification({
        message: "Profile saved successfully!",
        type: "success",
      });

      // sync to localStorage too
      localStorage.setItem("userProfile", JSON.stringify(profile));
    } catch {
      setNotification({ message: "Failed to save profile.", type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDelete = async (e: FormEvent) => {
    e.preventDefault();

    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/user/me`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete account");

      alert("Account deleted successfully");
      auth.logout();
      window.location.href = "/"; // redirect to home/login
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
  <div
    className={`
      max-w-4xl mx-auto md:p-8 rounded-lg shadow-xl
      border mt-23
      bg-white text-zinc-900 border-zinc-200
      dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700
    `}
  >
    <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
    <p className="text-zinc-600 dark:text-stone-400 mb-6">
      We will use this info to auto-fill your legal drafts.
    </p>

    {notification && (
      <div
        className={[
          "flex items-center p-3 mb-4 rounded-md text-sm border",
          notification.type === "success"
            ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50"
            : "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50",
        ].join(" ")}
      >
        {notification.type === "success" ? (
          <CheckCircle className="w-5 h-5 mr-2" />
        ) : (
          <AlertTriangle className="w-5 h-5 mr-2" />
        )}
        {notification.message}
      </div>
    )}

    <form onSubmit={handleSave} className="space-y-6">
      {formFields.map((field) => (
        <InputField
          key={field.name}
          config={field}
          value={profile[field.name]}
          onChange={handleChange}
        />
      ))}

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className={`
            inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md font-semibold
            transition-colors duration-200
            text-white
            bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 disabled:cursor-not-allowed
            dark:bg-red-600 dark:hover:bg-red-700 dark:disabled:bg-red-900
          `}
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" />
              Saving...
            </>
          ) : (
            "Save Profile"
          )}
        </button>
      </div>
    </form>

    <div className="mt-8 mx-auto w-full sm:w-1/3 flex items-center justify-center">
      <Button
        className="w-full px-6 py-5 gap-2 flex items-center justify-center
                   bg-red-600 hover:bg-red-700 text-white
                   dark:bg-red-700 dark:hover:bg-red-600"
        onClick={handleDelete}
      >
        <X className="w-5 h-5" />
        Delete Account
      </Button>
    </div>
  </div>
);
}
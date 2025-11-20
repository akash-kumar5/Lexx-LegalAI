"use client";
import { useState, useEffect, FormEvent, FC, useRef } from "react";
import { CheckCircle, AlertTriangle, Loader2, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

type ProfileData = {
  professionalTitle: string;
  barNumber: string;
  companyName: string;
  phone: string;
  address: string;
  courtPreferences: string;
  signatureBlock: string;
};

type DisplayData = {
  name: string;
  image: string;
  email: string;
};

type FormFieldConfig = {
  name: keyof ProfileData;
  label: string;
  type: "text" | "email" | "tel" | "textarea";
  placeholder: string;
  rows?: number;
  spanFull?: boolean;
};

const formFields: FormFieldConfig[] = [
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
    spanFull: true,
  },
  {
    name: "courtPreferences",
    label: "Preferred Courts",
    type: "textarea",
    placeholder: "High Court of Delhi, Supreme Court of India",
    rows: 2,
    spanFull: true,
  },
  {
    name: "signatureBlock",
    label: "Signature Block",
    type: "textarea",
    placeholder: "Your Name\nAdvocate\nEnrolment No.\nContact Details",
    rows: 3,
    spanFull: true,
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

  const autoCompleteMap: Partial<Record<keyof ProfileData, string>> = {
    professionalTitle: "organization-title",
    barNumber: "off",
    companyName: "organization",
    phone: "tel",
    address: "street-address",
    courtPreferences: "off",
    signatureBlock: "off",
  };

  const inputMode =
    type === "tel" ? "tel" : type === "email" ? "email" : undefined;

  const commonBase = `
    mt-1 block w-full rounded-md border px-3 py-2.5 text-base shadow-sm transition
    bg-zinc-50 text-zinc-900 border-zinc-300 placeholder:text-zinc-400
    focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
    dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700
    dark:placeholder:text-zinc-500 dark:focus:border-red-500 dark:focus:ring-red-600
  `;

  return (
    <div className="min-w-0">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-zinc-700 dark:text-stone-300"
      >
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          autoComplete={autoCompleteMap[name] ?? "off"}
          className={`${commonBase} h-auto resize-y`}
        />
      ) : (
        <input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          inputMode={inputMode}
          autoComplete={autoCompleteMap[name] ?? "off"}
          autoCapitalize={type === "email" ? "none" : undefined}
          className={`${commonBase} h-11`}
        />
      )}
    </div>
  );
};

export default function Profile() {
  const auth = useAuth();
  const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
    /\/$/,
    ""
  );

  const [profile, setProfile] = useState<ProfileData>({
    professionalTitle: "",
    barNumber: "",
    companyName: "",
    phone: "",
    address: "",
    courtPreferences: "",
    signatureBlock: "",
  });

  const initialProfileRef = useRef<ProfileData | null>(null);

  const [display, setDisplay] = useState<DisplayData>({
    name: "",
    image: "",
    email: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const notifTimerRef = useRef<number | null>(null);

  // Load profile on mount
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        if (!BASE_URL) throw new Error("API base url missing");
        const token = (localStorage.getItem("token") || "").replace(/\s+/g, "");
        const res = await fetch(`${BASE_URL}/user/me`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();

        const fetchedDisplay: DisplayData = {
          name: data.name || "",
          image: data.image || "",
          email: data.email || "",
        };
        const fetchedProfile: ProfileData = {
          professionalTitle: data.professionalTitle || "",
          barNumber: data.barNumber || "",
          companyName: data.companyName || "",
          phone: data.phone || "",
          address: data.address || "",
          courtPreferences: data.courtPreferences || "",
          signatureBlock: data.signatureBlock || "",
        };

        setDisplay(fetchedDisplay);
        setProfile(fetchedProfile);

        // Save initial profile for dirty-check
        initialProfileRef.current = fetchedProfile;

        localStorage.setItem(
          "userProfile",
          JSON.stringify({ ...fetchedDisplay, ...fetchedProfile })
        );
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const saved = localStorage.getItem("userProfile");
        if (saved) {
          try {
            const data = JSON.parse(saved);
            const savedDisplay: DisplayData = {
              name: data.name || "",
              image: data.image || "",
              email: data.email || "",
            };
            const savedProfile: ProfileData = {
              professionalTitle: data.professionalTitle || "",
              barNumber: data.barNumber || "",
              companyName: data.companyName || "",
              phone: data.phone || "",
              address: data.address || "",
              courtPreferences: data.courtPreferences || "",
              signatureBlock: data.signatureBlock || "",
            };
            setDisplay(savedDisplay);
            setProfile(savedProfile);
            initialProfileRef.current = savedProfile;
          } catch {
            setNotification({
              message: "Could not load profile data.",
              type: "error",
            });
          }
        } else {
          setNotification({
            message: "Could not load profile data.",
            type: "error",
          });
        }
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [BASE_URL]);

  useEffect(() => {
    return () => {
      // clean notif timer on unmount
      if (notifTimerRef.current) window.clearTimeout(notifTimerRef.current);
    };
  }, []);

  // simple deep-equality via JSON stringify is fine for this small form
  const isDirty = (() => {
    if (!initialProfileRef.current) return false;
    return (
      JSON.stringify(profile) !== JSON.stringify(initialProfileRef.current)
    );
  })();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const field = e.target.name as keyof ProfileData;
    const { value } = e.target;
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (isSaving || !isDirty) return;

    try {
      if (!BASE_URL) throw new Error("API base url missing");
      setIsSaving(true);
      setNotification(null);

      const token = (localStorage.getItem("token") || "").replace(/\s+/g, "");    
      const res = await fetch(`${BASE_URL}/user/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(profile),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Failed to save profile");
      }

      // success
      setNotification({
        message: "Profile saved successfully!",
        type: "success",
      });

      // update initial snapshot and localstorage
      initialProfileRef.current = profile;
      localStorage.setItem(
        "userProfile",
        JSON.stringify({ ...profile, ...display })
      );
    } catch (err) {
      console.error(err);
      setNotification({ message: "Failed to save profile.", type: "error" });
    } finally {
      setIsSaving(false);
      if (notifTimerRef.current) window.clearTimeout(notifTimerRef.current);
      notifTimerRef.current = window.setTimeout(
        () => setNotification(null),
        3000
      );
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    )
      return;

    try {
      if (!BASE_URL) throw new Error("API base url missing");
      const token = (localStorage.getItem("token") || "").replace(/\s+/g, "");
      const res = await fetch(`${BASE_URL}/user/me`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete account");

      alert("Account deleted successfully");
      auth.logout();
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className={`
        mx-auto w-full max-w-4xl
        px-4 sm:px-6 md:px-8
        p-6        mt-20
        rounded-lg shadow-sm
        border
        bg-white text-zinc-900 border-zinc-200
        dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700
      `}
    >
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">Your Profile</h1>
      <p className="text-zinc-600 dark:text-stone-400 mb-6">
        We will use this info to auto-fill your legal drafts.
      </p>

      {/* OAuth display header */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={display.image || "/avatar.png"}
          alt={display.name || "User"}
          className="h-16 w-16 rounded-full border object-cover border-zinc-200 dark:border-zinc-700"
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-lg truncate">
            {display.name || "—"}
          </div>
          <div className="text-sm text-zinc-500 truncate">{display.email}</div>
        </div>
      </div>

      {/* Toast */}
      {notification && (
        <div
          role={notification.type === "error" ? "alert" : "status"}
          aria-live="polite"
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
          <span className="min-w-0 truncate">{notification.message}</span>
        </div>
      )}

      <form
        id="profileForm"
        onSubmit={handleSave}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-6"
      >
        {formFields.map((field) => (
          <div
            key={field.name}
            className={field.spanFull ? "md:col-span-2" : ""}
          >
            <InputField
              config={field}
              value={profile[field.name]}
              onChange={handleChange}
            />
          </div>
        ))}

        {/* read-only email input (not posted) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-stone-300">
            Email
          </label>
          <input
            value={display.email}
            disabled
            className="mt-1 block w-full rounded-md border px-3 py-2.5 bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200"
          />
        </div>
      </form>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-semibold
                    text-red-900/10 hover:bg-red-50 dark:text-red-900 dark:hover:bg-red-900/30"
          type="button"
        >
          <p className="text-sm underline">Delete account</p>
        </button>

        <div className="ml-auto flex items-center gap-3 relative">
          <button
            form="profileForm"
            type="submit"
            disabled={!isDirty || isSaving}
            aria-disabled={!isDirty || isSaving}
            className={`
      inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-semibold
      text-white transition-all duration-200
      ${isDirty ? "opacity-100 visible" : "opacity-0 invisible"}
      ${
        !isDirty || isSaving
          ? "bg-zinc-400 cursor-not-allowed"
          : "bg-zinc-900 hover:bg-zinc-800"
      }
      dark:bg-red-600 dark:hover:bg-red-700 dark:disabled:bg-red-900
    `}
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                <span className="text-sm">Saving...</span>
              </>
            ) : (
              <span className="text-sm">Save Profile</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

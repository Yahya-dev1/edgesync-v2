"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  ShieldCheck,
  Lock,
  Trash2,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  X,
  Loader2,
  Pencil,
  Check,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────

interface KycRecord {
  status: string;
  created_at: string;
}

interface Props {
  profile: { full_name: string | null; email: string | null } | null;
  kyc: KycRecord | null;
  userId: string;
  email: string;
}

// ─── Helpers ──────────────────────────────────────────────────

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl bg-surface overflow-hidden"
      style={{ border: "0.5px solid var(--surface-border)" }}
    >
      <div
        className="px-4 py-3.5 md:px-5"
        style={{ borderBottom: "0.5px solid var(--surface-border)" }}
      >
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" strokeWidth={1.75} />
          {title}
        </h2>
      </div>
      <div className="px-4 py-4 md:px-5 md:py-5">{children}</div>
    </div>
  );
}

function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-xl bg-surface"
        style={{ border: "0.5px solid var(--surface-border)" }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── File drop zone ───────────────────────────────────────────

function FileZone({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex-1">
      <p className="text-xs font-medium text-foreground mb-1.5">{label}</p>
      <label
        className={cn(
          "flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg cursor-pointer transition-colors text-center",
          file
            ? "bg-primary/5 border-primary/30"
            : "bg-muted hover:bg-overlay/60"
        )}
        style={{
          border: file
            ? "1.5px dashed var(--primary)"
            : "1.5px dashed var(--surface-border)",
        }}
      >
        {file ? (
          <CheckCircle className="w-5 h-5 text-primary" />
        ) : (
          <Upload className="w-5 h-5 text-muted-foreground" />
        )}
        <span className="text-[11px] text-muted-foreground leading-snug">
          {file ? (
            <span className="text-primary font-medium truncate max-w-[120px] block">
              {file.name}
            </span>
          ) : (
            "Click to upload"
          )}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
      {file && (
        <button
          type="button"
          onClick={() => {
            onChange(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="mt-1 text-[10px] text-muted-foreground hover:text-red-400 transition-colors"
        >
          Remove
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────

export default function SettingsClient({ profile, kyc: initialKyc, userId, email }: Props) {
  const router = useRouter();

  // Profile
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(profile?.full_name ?? "");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  // KYC
  const [kycRecord, setKycRecord] = useState<KycRecord | null>(initialKyc);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [kycUploading, setKycUploading] = useState(false);
  const [kycError, setKycError] = useState("");
  const [showKycForm, setShowKycForm] = useState(false);

  // Password modal
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdChanging, setPwdChanging] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);

  // Delete account
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  // ── Handlers ────────────────────────────────────────────────

  async function saveName() {
    if (!nameValue.trim()) {
      setNameError("Name cannot be empty.");
      return;
    }
    setNameSaving(true);
    setNameError("");
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: nameValue.trim() })
      .eq("id", userId);
    if (error) {
      setNameError("Failed to save. Please try again.");
    } else {
      setEditingName(false);
    }
    setNameSaving(false);
  }

  async function handleKycSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!frontFile || !backFile) {
      setKycError("Please select both ID front and back images.");
      return;
    }
    setKycUploading(true);
    setKycError("");

    const supabase = createClient();
    const ts = Date.now();

    const frontExt = frontFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const backExt = backFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const frontPath = `${userId}/id_front_${ts}.${frontExt}`;
    const backPath = `${userId}/id_back_${ts}.${backExt}`;

    const [frontUpload, backUpload] = await Promise.all([
      supabase.storage.from("kyc-documents").upload(frontPath, frontFile, { upsert: true }),
      supabase.storage.from("kyc-documents").upload(backPath, backFile, { upsert: true }),
    ]);

    if (frontUpload.error || backUpload.error) {
      setKycError("Failed to upload documents. Please try again.");
      setKycUploading(false);
      return;
    }

    const now = new Date().toISOString();
    const { error: dbErr } = await supabase.from("kyc_submissions").upsert(
      {
        user_id: userId,
        id_front_url: frontPath,
        id_back_url: backPath,
        status: "pending",
        updated_at: now,
      },
      { onConflict: "user_id" }
    );

    if (dbErr) {
      setKycError("Failed to submit. Please try again.");
      setKycUploading(false);
      return;
    }

    setKycRecord({ status: "pending", created_at: now });
    setFrontFile(null);
    setBackFile(null);
    setShowKycForm(false);
    setKycUploading(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdError("");

    if (newPwd.length < 8) {
      setPwdError("New password must be at least 8 characters.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("Passwords do not match.");
      return;
    }

    setPwdChanging(true);
    const supabase = createClient();

    // Re-authenticate with current password first
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password: currentPwd,
    });
    if (signInErr) {
      setPwdError("Current password is incorrect.");
      setPwdChanging(false);
      return;
    }

    const { error: updateErr } = await supabase.auth.updateUser({ password: newPwd });
    if (updateErr) {
      setPwdError("Failed to update password. Please try again.");
      setPwdChanging(false);
      return;
    }

    setPwdSuccess(true);
    setPwdChanging(false);
  }

  function closePasswordModal() {
    setPasswordOpen(false);
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setPwdError("");
    setPwdSuccess(false);
    setShowCurrentPwd(false);
    setShowNewPwd(false);
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    const supabase = createClient();

    // Delete profile row (auth user remains for manual review)
    await supabase.from("profiles").delete().eq("id", userId);

    await supabase.auth.signOut();
    router.push("/login");
  }

  // ── KYC status badge ─────────────────────────────────────────

  const displayName = nameValue || profile?.full_name || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  function KycStatusContent() {
    if (!kycRecord || (kycRecord.status === "rejected" && showKycForm)) {
      return (
        <form onSubmit={handleKycSubmit}>
          {kycRecord?.status === "rejected" && (
            <div className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-400">
                Your previous submission was rejected. Please upload new documents.
              </p>
            </div>
          )}

          <p className="text-sm text-muted-foreground mb-4">
            Upload a government-issued photo ID to verify your identity.
          </p>

          <div className="flex gap-3 mb-4">
            <FileZone label="ID Front" file={frontFile} onChange={setFrontFile} />
            <FileZone label="ID Back" file={backFile} onChange={setBackFile} />
          </div>

          {kycError && (
            <p className="text-xs text-red-400 mb-3 font-medium">{kycError}</p>
          )}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={kycUploading || !frontFile || !backFile}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {kycUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {kycUploading ? "Submitting…" : "Submit for Verification"}
            </button>
            {kycRecord?.status === "rejected" && (
              <button
                type="button"
                onClick={() => setShowKycForm(false)}
                className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground/70 mt-3">
            Accepted formats: JPG, PNG, WEBP, PDF · Max 10 MB per file
          </p>
        </form>
      );
    }

    if (kycRecord.status === "pending") {
      return (
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-yellow-500/10 text-yellow-400">
                <Clock className="w-3 h-3" />
                Verification Pending
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Submitted on {fmtDate(kycRecord.created_at)}. Review typically takes 1–2 business days.
            </p>
          </div>
        </div>
      );
    }

    if (kycRecord.status === "approved") {
      return (
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your identity has been verified successfully.
            </p>
          </div>
        </div>
      );
    }

    if (kycRecord.status === "rejected") {
      return (
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-red-500/10 text-red-400">
                <XCircle className="w-3 h-3" />
                Rejected
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Your submission was rejected. Please resubmit with clear, valid documents.
            </p>
            <button
              onClick={() => setShowKycForm(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
            >
              Resubmit Documents
            </button>
          </div>
        </div>
      );
    }

    return null;
  }

  // ── Password input helper ─────────────────────────────────────

  function PwdInput({
    id,
    label,
    value,
    onChange,
    show,
    onToggleShow,
    placeholder,
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggleShow: () => void;
    placeholder?: string;
  }) {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">
          {label}
        </label>
        <div className="relative">
          <input
            id={id}
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required
            className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary transition-colors"
            style={{ background: "var(--muted)", border: "0.5px solid var(--surface-border)" }}
          />
          <button
            type="button"
            onClick={onToggleShow}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {show ? (
              <EyeOff className="w-4 h-4" strokeWidth={1.5} />
            ) : (
              <Eye className="w-4 h-4" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-base text-muted-foreground mt-1">
          Manage your account and preferences.
        </p>
      </div>

      <div className="space-y-4">
        {/* ── 1. Profile ──────────────────────────────────────────── */}
        <SectionCard title="Profile" icon={User}>
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <span className="text-base font-bold text-primary leading-none">{initials}</span>
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              {/* Full name */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveName();
                        if (e.key === "Escape") {
                          setEditingName(false);
                          setNameValue(profile?.full_name ?? "");
                          setNameError("");
                        }
                      }}
                      autoFocus
                      className="flex-1 px-3 py-2 rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-primary transition-colors"
                      style={{
                        background: "var(--muted)",
                        border: "0.5px solid var(--surface-border)",
                      }}
                    />
                    <button
                      onClick={saveName}
                      disabled={nameSaving}
                      className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-50 transition-colors flex-shrink-0"
                    >
                      {nameSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingName(false);
                        setNameValue(profile?.full_name ?? "");
                        setNameError("");
                      }}
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {profile?.full_name || (
                        <span className="text-muted-foreground italic">Not set</span>
                      )}
                    </span>
                    <button
                      onClick={() => setEditingName(true)}
                      className="flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Pencil className="w-3 h-3" strokeWidth={2} />
                    </button>
                  </div>
                )}
                {nameError && (
                  <p className="text-xs text-red-400 mt-1">{nameError}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email Address</p>
                <p className="text-sm text-foreground">{email}</p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── 2. KYC Verification ─────────────────────────────────── */}
        <SectionCard title="KYC Verification" icon={ShieldCheck}>
          <KycStatusContent />
        </SectionCard>

        {/* ── 3. Security ─────────────────────────────────────────── */}
        <SectionCard title="Security" icon={Lock}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Password</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update your account password.
              </p>
            </div>
            <button
              onClick={() => setPasswordOpen(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/80 transition-colors flex-shrink-0"
            >
              Change Password
            </button>
          </div>
        </SectionCard>

        {/* ── 4. Account ──────────────────────────────────────────── */}
        <SectionCard title="Account" icon={Trash2}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently remove your account data. This cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setDeleteOpen(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors flex-shrink-0"
            >
              Delete Account
            </button>
          </div>
        </SectionCard>
      </div>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="mt-10 pt-6" style={{ borderTop: "0.5px solid var(--surface-border)" }}>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
          {[
            { label: "Privacy Policy", href: "/privacy-policy" },
            { label: "Terms & Conditions", href: "/terms" },
            { label: "Risk Disclosure", href: "/risk-disclosure" },
            { label: "Cookie Policy", href: "/cookie-policy" },
            { label: "About Us", href: "/about" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
        <p className="text-[11px] text-muted-foreground/70 leading-relaxed mb-2">
          EdgeSync Markets is operated under FSA Seychelles regulatory framework. Trading forex and
          CFDs carries significant risk. Capital at risk.
        </p>
        <p className="text-[11px] text-muted-foreground/50">
          © 2025 EdgeSync Markets. All rights reserved.
        </p>
      </footer>

      {/* ── Change Password Modal ─────────────────────────────────── */}
      {passwordOpen && (
        <Modal onClose={closePasswordModal}>
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "0.5px solid var(--surface-border)" }}
          >
            <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
            <button
              onClick={closePasswordModal}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5">
            {pwdSuccess ? (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">Password Updated</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Your password has been changed successfully.
                </p>
                <button
                  onClick={closePasswordModal}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <PwdInput
                  id="current-pwd"
                  label="Current Password"
                  value={currentPwd}
                  onChange={setCurrentPwd}
                  show={showCurrentPwd}
                  onToggleShow={() => setShowCurrentPwd((v) => !v)}
                  placeholder="Enter current password"
                />
                <PwdInput
                  id="new-pwd"
                  label="New Password"
                  value={newPwd}
                  onChange={setNewPwd}
                  show={showNewPwd}
                  onToggleShow={() => setShowNewPwd((v) => !v)}
                  placeholder="Min. 8 characters"
                />
                <div>
                  <label htmlFor="confirm-pwd" className="block text-sm font-medium text-foreground mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-pwd"
                    type="password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary transition-colors"
                    style={{
                      background: "var(--muted)",
                      border: "0.5px solid var(--surface-border)",
                    }}
                  />
                </div>

                {pwdError && (
                  <p className="text-xs text-red-400 font-medium">{pwdError}</p>
                )}

                <button
                  type="submit"
                  disabled={pwdChanging}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {pwdChanging && <Loader2 className="w-4 h-4 animate-spin" />}
                  {pwdChanging ? "Updating…" : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </Modal>
      )}

      {/* ── Delete Account Dialog ─────────────────────────────────── */}
      {deleteOpen && (
        <Modal onClose={() => { if (!deleting) { setDeleteOpen(false); setDeleteConfirm(""); } }}>
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "0.5px solid var(--surface-border)" }}
          >
            <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Delete Account
            </h3>
            <button
              onClick={() => { setDeleteOpen(false); setDeleteConfirm(""); }}
              disabled={deleting}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3 px-3 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-400 leading-relaxed">
                This action will permanently delete your account data and cannot be undone. Your
                trading history, deposits, and profile will be removed.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Type{" "}
                <span
                  className="px-1.5 py-0.5 rounded font-mono text-xs text-red-400"
                  style={{ background: "var(--muted)" }}
                >
                  DELETE
                </span>{" "}
                to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                style={{
                  background: "var(--muted)",
                  border: "0.5px solid var(--surface-border)",
                }}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setDeleteOpen(false); setDeleteConfirm(""); }}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-overlay border border-transparent transition-colors disabled:opacity-50"
                style={{ border: "0.5px solid var(--surface-border)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== "DELETE" || deleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? "Deleting…" : "Delete Account"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

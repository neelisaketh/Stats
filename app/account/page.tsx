"use client";
import Link from "next/link";
import { ProfileForm } from "@/components/profile-form";
import { useProgress } from "@/components/progress-provider";
export default function Account() {
  const { user, loading, profile, isAdmin } = useProgress();
  return (
    <main className="activity-page wrap narrow">
      <div className="catalog-heading">
        <span className="kicker">My account</span>
        <h1>Your classroom.</h1>
        <p>
          Confirm your grade, school year, and class period before posting
          scores.
        </p>
      </div>
      {loading ? (
        <p role="status">Loading your account…</p>
      ) : !user ? (
        <Link className="button button-accent" href="/auth">
          Sign in
        </Link>
      ) : (
        <>
          <section className="surface">
            <ProfileForm key={user.id + Boolean(profile)} profile={profile} />
          </section>
          <div className="account-links">
            <Link href="/progress" className="button button-outline">
              My progress
            </Link>
            <Link href="/auth/reset-password" className="quiet-button">
              Change password
            </Link>
            <Link href="/admin" className="quiet-button">
              {isAdmin ? "Administrator dashboard" : "Administrator access"}
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

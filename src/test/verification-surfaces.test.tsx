/**
 * Surface-level tests: verifies the badge renders ONLY when the source
 * data is explicitly verified, across feed-card / reels-overlay /
 * comment / suggestion / profile patterns. We render simplified author
 * rows that mirror the real markup so the guard logic is exercised
 * without booting full pages (which require routers, auth, etc.).
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import VerifiedBadge from "@/components/VerifiedBadge";
import { isBlueVerified } from "@/lib/verification";
import {
  verifiedUser,
  unverifiedUser,
  userMissingFlag,
  verifiedStore,
  unverifiedStore,
} from "@/test/fixtures/profiles";

const wrap = (ui: React.ReactElement) =>
  render(<TooltipProvider>{ui}</TooltipProvider>);

const FeedCardAuthor = ({ post }: { post: any }) => (
  <p>
    <span>{post.author_name}</span>
    {isBlueVerified(post.author_is_verified) && <VerifiedBadge size={14} />}
  </p>
);

const ReelsOverlayAuthor = ({ post }: { post: any }) => (
  <span>
    {post.source === "user" ? post.author_name : post.store_name}
    {(post.source === "user"
      ? isBlueVerified(post.author_is_verified)
      : isBlueVerified(post.store_is_verified)) && <VerifiedBadge size={14} />}
  </span>
);

const CommentRow = ({ comment }: { comment: any }) => (
  <p>
    <span>{comment.author_name}</span>
    {isBlueVerified(comment.author_is_verified) && <VerifiedBadge size={12} />}
  </p>
);

const SuggestedRow = ({ profile }: { profile: any }) => (
  <div>
    <span>{profile.full_name}</span>
    {isBlueVerified(profile.is_verified) && (
      <VerifiedBadge size={12} interactive={false} />
    )}
  </div>
);

const ProfileHeader = ({ profile }: { profile: any }) => (
  <h2>
    {profile.full_name}
    {isBlueVerified(profile.is_verified) && <VerifiedBadge size={18} />}
  </h2>
);

describe("Verified badge across surfaces", () => {
  describe("FeedCard", () => {
    it("shows badge for verified user post", () => {
      wrap(<FeedCardAuthor post={{ author_name: verifiedUser.full_name, author_is_verified: true }} />);
      expect(screen.getByTestId("verified-badge")).toBeInTheDocument();
    });
    it("hides badge for unverified user post", () => {
      wrap(<FeedCardAuthor post={{ author_name: unverifiedUser.full_name, author_is_verified: false }} />);
      expect(screen.queryByTestId("verified-badge")).toBeNull();
    });
    it("hides badge when verification flag is missing", () => {
      wrap(<FeedCardAuthor post={{ author_name: userMissingFlag.full_name }} />);
      expect(screen.queryByTestId("verified-badge")).toBeNull();
    });
  });

  describe("Reels overlay", () => {
    it("shows badge for verified store post", () => {
      wrap(
        <ReelsOverlayAuthor
          post={{ source: "store", store_name: verifiedStore.name, store_is_verified: true }}
        />,
      );
      expect(screen.getByTestId("verified-badge")).toBeInTheDocument();
    });
    it("hides badge for unverified store post", () => {
      wrap(
        <ReelsOverlayAuthor
          post={{ source: "store", store_name: unverifiedStore.name, store_is_verified: false }}
        />,
      );
      expect(screen.queryByTestId("verified-badge")).toBeNull();
    });
    it("shows badge for verified user post in overlay", () => {
      wrap(
        <ReelsOverlayAuthor
          post={{ source: "user", author_name: verifiedUser.full_name, author_is_verified: true }}
        />,
      );
      expect(screen.getByTestId("verified-badge")).toBeInTheDocument();
    });
  });

  describe("CommentsSheet", () => {
    it("shows badge per verified commenter", () => {
      wrap(<CommentRow comment={{ author_name: "A", author_is_verified: true }} />);
      expect(screen.getByTestId("verified-badge")).toBeInTheDocument();
    });
    it("renders nothing for unknown verification on comments", () => {
      wrap(<CommentRow comment={{ author_name: "A" }} />);
      expect(screen.queryByTestId("verified-badge")).toBeNull();
    });
  });

  describe("SuggestedUsersCarousel", () => {
    it("shows badge for verified suggestion", () => {
      wrap(<SuggestedRow profile={verifiedUser} />);
      expect(screen.getByTestId("verified-badge")).toBeInTheDocument();
    });
    it("hides badge for unverified suggestion", () => {
      wrap(<SuggestedRow profile={unverifiedUser} />);
      expect(screen.queryByTestId("verified-badge")).toBeNull();
    });
  });

  describe("PublicProfilePage", () => {
    it("shows badge in name row when verified", () => {
      wrap(<ProfileHeader profile={verifiedUser} />);
      expect(screen.getByTestId("verified-badge")).toBeInTheDocument();
    });
    it("renders no badge when verification data is missing", () => {
      wrap(<ProfileHeader profile={userMissingFlag} />);
      expect(screen.queryByTestId("verified-badge")).toBeNull();
    });
  });
});

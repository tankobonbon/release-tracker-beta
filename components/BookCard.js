"use client";

import { Check, RotateCcw, Square, X } from "lucide-react";
import {
  formatReleaseDate,
  formatRelativeDate,
  getProductDate,
} from "../hooks/useFollowShelfState";

function getShopifySizedImage(url, width) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("width", String(width));
    return parsed.toString();
  } catch {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}width=${width}`;
  }
}

export default function BookCard({
  book,
  selected = false,
  onToggleSelect,
  actionLabel,
  onAction,
  actionDisabled = false,
  cornerRemove = false,
  onCornerRemove,
  removeIcon = false,
}) {
  const hasCoverNotFinal = (book.tags || []).includes("Cover not final");
  const dateLabel = book.releaseDate
    ? `Releases ${formatReleaseDate(book.releaseDate)}`
    : formatRelativeDate(getProductDate(book));
  const showRestoreButton =
    actionLabel?.toLowerCase() === "restore" && typeof onAction === "function";
  const imageUrl = book.featuredImage?.url || "";
  const src320 = getShopifySizedImage(imageUrl, 320);
  const src240 = getShopifySizedImage(imageUrl, 240);
  const src180 = getShopifySizedImage(imageUrl, 180);

  function handleOpen() {
    if (book.onlineStoreUrl) {
      window.open(book.onlineStoreUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <article className={`coverCard ${selected ? "coverCard--selected" : ""}`}>
      {onToggleSelect ? (
        <button
          type="button"
          className={`coverCard__select ${selected ? "coverCard__select--selected" : ""} ${removeIcon ? "coverCard__select--remove" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleSelect(book.id);
          }}
          aria-pressed={selected}
          aria-label={selected ? `Deselect ${book.title}` : `Select ${book.title}`}
        >
          {removeIcon ? (
            <X size={14} strokeWidth={2.25} />
          ) : selected ? (
            <Check size={15} strokeWidth={2.4} />
          ) : (
            <Square size={15} strokeWidth={2.1} />
          )}
        </button>
      ) : null}

      {cornerRemove ? (
        <button
          type="button"
          className="coverCard__remove"
          onClick={(event) => {
            event.stopPropagation();
            onCornerRemove?.(book.id);
          }}
          aria-label={`Remove ${book.title} from pre-orders`}
        >
          <X size={14} strokeWidth={2.2} />
        </button>
      ) : null}

      {showRestoreButton ? (
        <button
          type="button"
          className="coverCard__restore"
          onClick={(event) => {
            event.stopPropagation();
            onAction?.(book.id);
          }}
          disabled={actionDisabled}
          aria-label={`Restore ${book.title}`}
        >
          <RotateCcw size={14} strokeWidth={2.1} />
        </button>
      ) : null}

      <button type="button" className="coverCard__link" onClick={handleOpen}>
        {imageUrl ? (
          <img
            src={src240}
            srcSet={`${src180} 180w, ${src240} 240w, ${src320} 320w`}
            sizes="(max-width: 767px) 42vw, (max-width: 1023px) 26vw, 180px"
            alt={book.featuredImage.altText || book.title}
            className="coverCard__image"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="coverCard__fallback">No cover</div>
        )}
        <div className="coverCard__overlay">
          <div className="coverCard__overlayInner">
            <strong className="coverCard__title">{book.title}</strong>
            {hasCoverNotFinal ? (
              <em className="coverCard__flag">Cover not final</em>
            ) : null}
            <span className="coverCard__meta">{dateLabel}</span>
          </div>
        </div>
      </button>

      {!showRestoreButton && actionLabel ? (
        <button
          type="button"
          className="cardActionButton"
          onClick={() => onAction?.(book.id)}
          disabled={actionDisabled}
        >
          {actionLabel}
        </button>
      ) : null}
    </article>
  );
}

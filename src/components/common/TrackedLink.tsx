/**
 * ZIVO Tracked Link Component
 * 
 * Renders an affiliate link that routes through /out for tracking
 * Automatically adds required security attributes
 */

import { ReactNode, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { buildOutboundURL } from '@/lib/outboundTracking';
import { cn } from '@/lib/utils';

export interface TrackedLinkProps {
  /** Partner ID for tracking */
  partnerId: string;
  /** Partner display name */
  partnerName: string;
  /** Product type (flights, hotels, cars, etc.) */
  product: string;
  /** Page source for tracking */
  pageSource: string;
  /** Destination URL */
  destinationUrl: string;
  /** Link content */
  children: ReactNode;
  /** Additional class names */
  className?: string;
  /** Disable the link */
  disabled?: boolean;
  /** Show as button */
  asButton?: boolean;
}

const TrackedLink = forwardRef<HTMLAnchorElement, TrackedLinkProps>(
  ({ 
    partnerId, 
    partnerName, 
    product, 
    pageSource, 
    destinationUrl, 
    children, 
    className,
    disabled,
    asButton,
    ...props 
  }, ref) => {
    const outboundUrl = buildOutboundURL(
      partnerId,
      partnerName,
      product,
      pageSource,
      destinationUrl
    );
    
    if (disabled) {
      return (
        <span className={cn(className, 'opacity-50 cursor-not-allowed')} {...props}>
          {children}
        </span>
      );
    }
    
    return (
      <Link
        ref={ref}
        to={outboundUrl}
        className={className}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

TrackedLink.displayName = 'TrackedLink';

export default TrackedLink;

/**
 * Direct tracked anchor for external links
 * Opens /out in new tab directly
 */
export interface TrackedAnchorProps extends Omit<TrackedLinkProps, 'asButton'> {
  /** Open in new tab (default: true) */
  newTab?: boolean;
}

export const TrackedAnchor = forwardRef<HTMLAnchorElement, TrackedAnchorProps>(
  ({ 
    partnerId, 
    partnerName, 
    product, 
    pageSource, 
    destinationUrl, 
    children, 
    className,
    disabled,
    newTab = true,
    ...props 
  }, ref) => {
    const outboundUrl = buildOutboundURL(
      partnerId,
      partnerName,
      product,
      pageSource,
      destinationUrl
    );
    
    if (disabled) {
      return (
        <span className={cn(className, 'opacity-50 cursor-not-allowed')}>
          {children}
        </span>
      );
    }
    
    return (
      <a
        ref={ref}
        href={outboundUrl}
        target={newTab ? '_blank' : undefined}
        rel="nofollow sponsored noopener noreferrer"
        className={className}
        {...props}
      >
        {children}
      </a>
    );
  }
);

TrackedAnchor.displayName = 'TrackedAnchor';

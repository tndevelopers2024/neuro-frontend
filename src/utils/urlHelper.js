/**
 * Resolves the backend base URL without trailing slash or '/api'.
 * For example:
 * 'https://api.neuromindscholars.com/api' -> 'https://api.neuromindscholars.com'
 * 'http://localhost:5000/api' -> 'http://localhost:5000'
 */
export const getBackendBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  // ONLY remove trailing /api or /api/ at the end of the URL ($)
  return apiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
};

/**
 * Resolves any media/asset URL into a valid, reachable URL.
 * Automatically fixes previously corrupted URLs like:
 * 'https:/.neuromindscholars.com/api/uploads/...'
 * or 'https://api.neuromindscholars.com/api/uploads/...'
 */
export const getAssetUrl = (url) => {
  if (!url || typeof url !== 'string') return '';

  // If already an external UI avatar or other third-party domain (not neuromind)
  if (url.startsWith('http') && !url.includes('neuromindscholars.com')) {
    return url;
  }

  const backendBase = getBackendBaseUrl();

  // If it's an upload path (either full corrupted URL, relative, or with /api)
  if (url.includes('/uploads/')) {
    const uploadPath = url.substring(url.indexOf('/uploads/'));
    return `${backendBase}${uploadPath}`;
  }

  if (url.startsWith('/uploads')) {
    return `${backendBase}${url}`;
  }

  return url;
};

/**
 * Resolves avatar image URL with fallback to UI-Avatars if not present or placeholder.
 */
export const getAvatarUrl = (userOrImage, fullName = '') => {
  let image = typeof userOrImage === 'string' ? userOrImage : userOrImage?.profileImage;
  const name = typeof userOrImage === 'object' && userOrImage?.fullName ? userOrImage.fullName : fullName;

  if (!image || image.includes('unsplash') || image.trim() === '') {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=126BEE&color=fff&size=250`;
  }

  return getAssetUrl(image);
};

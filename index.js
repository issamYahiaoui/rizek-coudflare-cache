const API_PREFIX = "/v1/api";

const CACHED_PATHS = {
  [API_PREFIX + "/content/client/ALERT"]: true,
  [API_PREFIX + "/content/client/BANNERS"]: true,
  [API_PREFIX + "/content/client/ONBOARDING"]: true,
  [API_PREFIX + "/content/client/ANNOUNCEMENT"]: true,
  [API_PREFIX + "/content/client/CLIENT_CANCEL_REASON"]: true,
  [API_PREFIX + "/content/client/HERO_CANCEL_REASON"]: true,
  [API_PREFIX + "/content/client/PCR_INFO"]: true,
  [API_PREFIX + "/content/client/SECTION"]: true,
  [API_PREFIX + "/content/client/SECTION_ITEM"]: true,
  [API_PREFIX + "/content/client/CANNOT_FULFILL_REASON"]: true,
  [API_PREFIX + "/content/client/CANNOT_COMPLETE_REASON"]: true,
  [API_PREFIX + "/client/cac/operations"]: true,
  [API_PREFIX + "/cac/operating/services_tree"]: true,
  [API_PREFIX + "/client/recent-bookings/stats"]: true,
  [API_PREFIX + "/client/content/cms/question-forms"]: true,
  [API_PREFIX + "/partners/by-service-city"]: true,
  [API_PREFIX + "/client/searchStats/popular"]: true,
};

addEventListener('fetch', event => {
  try {
    event.respondWith(handleRequest(event));
  } catch (e) {
    return event.respondWith(new Response('Error Thrown ' + e.message))
  }
});

function extractLanguages(request) {
  return request.headers.get("accept-language") || 'en';
}

async function handleRequest(event) {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method === 'GET' && CACHED_PATHS[url.pathname]) {
    const cacheKey = new Request(url.toString() + 'lang=' + extractLanguages(request))
    const cache = caches.default;
    let response = await cache.match(cacheKey);
    if (!response) {
      console.log(`Response for request url: ${request.url} not present in cache. Fetching and caching request.`);
      response = await fetch(request);
      response = new Response(response.body, response);
      response.headers.append('Cache-Control', 's-maxage=120');
      event.waitUntil(cache.put(cacheKey, response.clone()));
    }
    return response;
  } else {
    return fetch(request);
  }
}

#include <stdio.h>
#include <string.h>

typedef struct {
  const char *base_url;
  const char *project;
  const char *branch;
  const char *query;
  int page;
  int page_size;
  int timeout_ms;
  int include_archived;
} MergePreviewRequest;

static int clamp_page_size(int page_size) {
  if (page_size < 1) {
    return 1;
  }
  if (page_size > 100) {
    return 100;
  }
  return page_size;
}

static void append_bool_param(char *buffer, size_t size, const char *name, int enabled) {
  snprintf(buffer + strlen(buffer), size - strlen(buffer), "&%s=%s", name, enabled ? "true" : "false");
}

static void append_debug_header(char *response, size_t size, const MergePreviewRequest *request) {
  snprintf(
    response + strlen(response),
    size - strlen(response),
    "X-Debug-Trace: project=%s branch=%s query=%s page=%d page_size=%d timeout_ms=%d\n",
    request->project,
    request->branch,
    request->query,
    request->page,
    request->page_size,
    request->timeout_ms
  );
}

int build_merge_preview_url(const MergePreviewRequest *request, char *buffer, size_t size) {
  if (!request || !buffer || size == 0) {
    return -1;
  }

  snprintf(
    buffer,
    size,
    "%s/api/v1/projects/%s/compare?branch=%s&query=%s&page=%d&page_size=%d&timeout_ms=%d",
    request->base_url,
    request->project,
    request->branch,
    request->query,
    request->page,
    clamp_page_size(request->page_size),
    request->timeout_ms
  );
  append_bool_param(buffer, size, "include_archived", request->include_archived);

  return 0;
}

int send_merge_preview_request(const MergePreviewRequest *request, char *response, size_t response_size) {
  char url[1024];
  int status = build_merge_preview_url(request, url, sizeof(url));

  if (status != 0) {
    return status;
  }

  snprintf(response, response_size, "GET %s HTTP/1.1\nHost: merge-preview.internal\n", url);
  append_debug_header(response, response_size, request);
  snprintf(response + strlen(response), response_size - strlen(response), "\n");
  return 200;
}
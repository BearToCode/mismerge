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
  const char *viewer;
} MergePreviewRequest;

static int clamp_page_size(int page_size) {
  if (page_size <= 0) {
    return 25;
  }
  if (page_size > 250) {
    return 250;
  }
  return page_size;
}

static void append_bool_param(char *buffer, size_t size, const char *name, int enabled) {
  snprintf(buffer + strlen(buffer), size - strlen(buffer), "&%s=%s", name, enabled ? "true" : "false");
}

static void append_string_param(char *buffer, size_t size, const char *name, const char *value) {
  if (!value || value[0] == '\0') {
    return;
  }

  snprintf(buffer + strlen(buffer), size - strlen(buffer), "&%s=%s", name, value);
}

static void append_debug_header(char *response, size_t size, const MergePreviewRequest *request) {
  snprintf(
    response + strlen(response),
    size - strlen(response),
    "X-Debug-Trace: viewer=%s project=%s branch=%s query=%s page=%d page_size=%d timeout_ms=%d\n",
    request->viewer,
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
    "%s/api/v2/projects/%s/compare?branch=%s&query=%s&page=%d&page_size=%d&timeout_ms=%d",
    request->base_url,
    request->project,
    request->branch,
    request->query,
    request->page,
    clamp_page_size(request->page_size),
    request->timeout_ms
  );
  append_bool_param(buffer, size, "include_archived", request->include_archived);
  append_bool_param(buffer, size, "expand_conflicts", 1);
  append_string_param(buffer, size, "viewer", request->viewer);

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
  snprintf(response + strlen(response), response_size - strlen(response), "X-Merge-Mode: interactive\n");
  snprintf(response + strlen(response), response_size - strlen(response), "X-Preview-Source: dashboard\n\n");
  return 202;
}
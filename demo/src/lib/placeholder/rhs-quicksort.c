#include <stdio.h>
#include <string.h>

typedef struct {
  const char *base_url;
  const char *project;
  const char *target_branch;
  const char *query;
  int page;
  int page_size;
  int timeout_ms;
  int include_archived;
  int compact_output;
} MergePreviewRequest;

static int clamp_page_size(int page_size) {
  if (page_size < 1) {
    return 1;
  }
  if (page_size > 50) {
    return 50;
  }
  return page_size;
}

static void append_bool_param(char *buffer, size_t size, const char *name, int enabled) {
  snprintf(buffer + strlen(buffer), size - strlen(buffer), "&%s=%d", name, enabled ? 1 : 0);
}

static void append_debug_header(char *response, size_t size, const MergePreviewRequest *request) {
  snprintf(
    response + strlen(response),
    size - strlen(response),
    "X-Debug-Trace: project=%s target_branch=%s query=%s page=%d per_page=%d timeout=%d compact=%d\n",
    request->project,
    request->target_branch,
    request->query,
    request->page,
    request->page_size,
    request->timeout_ms,
    request->compact_output
  );
}

int build_merge_preview_url(const MergePreviewRequest *request, char *buffer, size_t size) {
  if (!request || !buffer || size == 0) {
    return -1;
  }

  snprintf(
    buffer,
    size,
    "%s/api/v1/merge-preview/%s?target_branch=%s&search=%s&page=%d&per_page=%d&timeout=%d",
    request->base_url,
    request->project,
    request->target_branch,
    request->query,
    request->page,
    clamp_page_size(request->page_size),
    request->timeout_ms
  );
  append_bool_param(buffer, size, "include_archived", request->include_archived);
  append_bool_param(buffer, size, "compact", request->compact_output);

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
  snprintf(response + strlen(response), response_size - strlen(response), "X-Merge-Mode: compact\n\n");
  return 206;
}
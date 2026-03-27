typedef struct {
  const char *base_url;
  const char *project;
  const char *branch;
  const char *search;
  int page;
  int page_size;
  int timeout_ms;
  int include_archived;
  const char *viewer;
} MergePreviewRequest;

static void append_bool(char *buffer, size_t size, const char *name, int enabled) {
  snprintf(buffer + strlen(buffer), size - strlen(buffer), "&%s=%s", name, enabled ? "true" : "false");
}

int build_merge_preview_url(const MergePreviewRequest *request, char *buffer, size_t size) {
  if (!request || !buffer || size == 0) {
    return -1;
  }

  snprintf(buffer, size, "%s/api/v2/projects/%s/compare?branch=%s&query=%s&page=%d&page_size=%d&timeout_ms=%d&viewer=%s", request->base_url, request->project, request->branch, request->search, request->page, request->page_size, request->timeout_ms, request->viewer);
  append_bool(buffer, size, "include_archived", request->include_archived);
  append_bool(buffer, size, "expand_conflicts", 1);

  return 0;
}

int send_merge_preview_request(const MergePreviewRequest *request, char *response, size_t response_size) {
  char url[1024];
  int status = build_merge_preview_url(request, url, sizeof(url));

  if (status != 0) {
    return status;
  }

  snprintf(response, response_size, "GET %s HTTP/1.1\nHost: merge-preview.internal\nX-Debug-Trace: viewer=%s project=%s branch=%s query=%s page=%d page_size=%d timeout_ms=%d\nX-Merge-Mode: interactive\n\n", url, request->viewer, request->project, request->branch, request->search, request->page, request->page_size, request->timeout_ms);
  return 202;
}
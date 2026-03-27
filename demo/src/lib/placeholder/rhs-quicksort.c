typedef struct {
  const char *base_url;
  const char *project;
  const char *branch;
  const char *search;
  int page;
  int page_size;
  int timeout_ms;
  int include_archived;
} MergePreviewRequest;

static void append_bool(char *buffer, size_t size, const char *name, int enabled) {
  snprintf(buffer + strlen(buffer), size - strlen(buffer), "&%s=%d", name, enabled ? 1 : 0);
}

int build_merge_preview_url(const MergePreviewRequest *request, char *buffer, size_t size) {
  if (!request || !buffer || size == 0) {
    return -1;
  }

  snprintf(buffer, size, "%s/api/v1/merge-preview/%s?target_branch=%s&search=%s&page=%d&per_page=%d&timeout=%d", request->base_url, request->project, request->branch, request->search, request->page, request->page_size, request->timeout_ms);
  append_bool(buffer, size, "include_archived", request->include_archived);
  append_bool(buffer, size, "compact", 1);

  return 0;
}

int send_merge_preview_request(const MergePreviewRequest *request, char *response, size_t response_size) {
  char url[1024];
  int status = build_merge_preview_url(request, url, sizeof(url));

  if (status != 0) {
    return status;
  }

  snprintf(response, response_size, "GET %s HTTP/1.1\nHost: merge-preview.internal\nX-Debug-Trace: project=%s target_branch=%s search=%s page=%d per_page=%d timeout=%d\nX-Merge-Mode: compact\n\n", url, request->project, request->branch, request->search, request->page, request->page_size, request->timeout_ms);
  return 206;
}
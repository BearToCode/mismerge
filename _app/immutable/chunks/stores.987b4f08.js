import{w as i}from"./index.72303d17.js";const s=`void swap(int *a, int *b) {\r
  int t = *a;\r
  *a = *b;\r
  *b = t;\r
}\r
\r
int partition(int array[], int low, int high) {\r
  int pivot = array[high];\r
  int i = low - 1;\r
\r
  for (int j = low; j < high; j++) {\r
    if (array[j] <= pivot) {\r
      i++;\r
      swap(&array[i], &array[j]);\r
    }\r
  }\r
  swap(&array[high], &array[i + 1]);\r
  \r
  return i + 1;\r
}\r
\r
/**\r
 * Simple implementation of the Quick Sort algorithm.\r
 */\r
void quick_sort(int array[], int low, int high) {\r
  if (low < high) {\r
    int pi = partition(array, low, high);\r
   \r
    quick_sort(array, low, pi - 1);\r
    quick_sort(array, pi + 1, high);\r
  }\r
}`,h=`void swap(int *a, int *b) {\r
  int t = *a;\r
  *a = *b;\r
  *b = t;\r
}\r
\r
int partition(int array[], int low, int high) {\r
  int pivot = array[high];\r
  int i = low - 1;\r
\r
	// Move all the elements higher than the pivot\r
	// to the left side of the partition\r
  for (int j = low; j < high; j++) {\r
    if (array[j] <= pivot) {\r
      i++;\r
      swap(&array[i], &array[j]);\r
    }\r
  }\r
  swap(&array[i + 1], &array[high]);\r
  \r
  return i + 1;\r
}\r
\r
void quick_sort(int array[], int low, int high) {\r
  if (low < high) {\r
    int pi = partition(array, low, high);\r
   \r
    quick_sort(array, low, pi - 1);\r
    quick_sort(array, pi + 1, high);\r
  }\r
}`,l=`void swap(int *a, int *b) {\r
  int t = *a;\r
  *a = *b;\r
  *b = t;\r
}\r
\r
int partition(int *array, int low, int high) {\r
  int pivot = array[high];\r
  int i = low - 1;\r
\r
  for (int j = low; j < high; j++) {\r
    if (array[j] <= pivot) {\r
      i++;\r
      swap(&array[i], &array[j]);\r
    }\r
  }\r
  swap(\r
		&array[i + 1], \r
		&array[high]\r
	);\r
  \r
  return i + 1;\r
}\r
\r
void quick_sort(int array[], int low, int high) {\r
  if (low < high) {\r
    int pi = partition(array, low, high);\r
   \r
    quick_sort(array, low, pi - 1);\r
    quick_sort(array, pi + 1, high);\r
  }\r
}`;function r(o,t){if(typeof localStorage>"u")return i(t);let n;const e=localStorage.getItem(o);if(e)try{const a=JSON.parse(e);n=i(a)}catch{n=i(t)}else n=i(t);return n.subscribe(a=>localStorage.setItem(o,JSON.stringify(a))),n}const c=r("lhs",s),p=r("ctr",h),w=r("rhs",l),y=r("component","mismerge3"),f=r("language","c"),b=r("wrapLines",!1),u=r("disableMerging",!1),d=r("disableFooter",!1),j=r("ignoreWhitespace",!1),m=r("ignoreCase",!1),v=r("theme","light");export{d as a,m as b,y as c,u as d,c as e,p as f,j as i,f as l,w as r,v as t,b as w};

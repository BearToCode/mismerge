import{w as t}from"./index.uguH6FDr.js";const s=`void swap(int *a, int *b) {
  int t = *a;
  *a = *b;
  *b = t;
}

int partition(int array[], int low, int high) {
  int pivot = array[high];
  int i = low - 1;

  for (int j = low; j < high; j++) {
    if (array[j] <= pivot) {
      i++;
      swap(&array[i], &array[j]);
    }
  }
  swap(&array[high], &array[i + 1]);
  
  return i + 1;
}

/**
 * Simple implementation of the Quick Sort algorithm.
 */
void quick_sort(int array[], int low, int high) {
  if (low < high) {
    int pi = partition(array, low, high);
   
    quick_sort(array, low, pi - 1);
    quick_sort(array, pi + 1, high);
  }
}`,h=`void swap(int *a, int *b) {
  int t = *a;
  *a = *b;
  *b = t;
}

int partition(int array[], int low, int high) {
  int pivot = array[high];
  int i = low - 1;

	// Move all the elements higher than the pivot
	// to the left side of the partition
  for (int j = low; j < high; j++) {
    if (array[j] <= pivot) {
      i++;
      swap(&array[i], &array[j]);
    }
  }
  swap(&array[i + 1], &array[high]);
  
  return i + 1;
}

void quick_sort(int array[], int low, int high) {
  if (low < high) {
    int pi = partition(array, low, high);
   
    quick_sort(array, low, pi - 1);
    quick_sort(array, pi + 1, high);
  }
}`,l=`void swap(int *a, int *b) {
  int t = *a;
  *a = *b;
  *b = t;
}

int partition(int *array, int low, int high) {
  int pivot = array[high];
  int i = low - 1;

  for (int j = low; j < high; j++) {
    if (array[j] <= pivot) {
      i++;
      swap(&array[i], &array[j]);
    }
  }
  swap(
		&array[i + 1], 
		&array[high]
	);
  
  return i + 1;
}

void quick_sort(int array[], int low, int high) {
  if (low < high) {
    int pi = partition(array, low, high);
   
    quick_sort(array, low, pi - 1);
    quick_sort(array, pi + 1, high);
  }
}`;function n(o,a){if(typeof localStorage>"u")return t(a);let i;const e=localStorage.getItem(o);if(e)try{const r=JSON.parse(e);i=t(r)}catch{i=t(a)}else i=t(a);return i.subscribe(r=>localStorage.setItem(o,JSON.stringify(r))),i}const c=n("lhs",s),p=n("ctr",h),w=n("rhs",l),y=n("component","mismerge3"),f=n("language","c"),b=n("wrapLines",!1),u=n("disableMerging",!1),d=n("disableFooter",!1),j=n("ignoreWhitespace",!1),m=n("ignoreCase",!1),v=n("theme","light");export{d as a,m as b,y as c,u as d,c as e,p as f,j as i,f as l,w as r,v as t,b as w};

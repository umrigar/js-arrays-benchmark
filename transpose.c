#include <emscripten.h>

#include <stdint.h>

EMSCRIPTEN_KEEPALIVE
void transpose(uint32_t buf[], int n) {
  for (int i = 0; i < n; i++) {
    for (int j = i+1; j < n; j++) {
      const int i1 = i*n + j;
      const int i2 = j*n + i;
      const uint32_t t = buf[i1];
      buf[i1] = buf[i2];
      buf[i2] = t;
    }
  }
}

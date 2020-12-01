CC = emcc 
CFLAGS = -O3

EMCC_ARGS = -s MODULARIZE \
	    -s EXPORTED_FUNCTIONS="['_transpose', '_malloc', '_free' ]" \
            -s EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap']" \
	    -s WASM=1 \

TARGET = transpose.js

all:		$(TARGET)

transpose.js:	transpose.c
		$(CC) $(EMCC_ARGS) $(CFLAGS) $< -o $@

clean:
		rm -f *~ $(TARGET) *.wasm



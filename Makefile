build:
	@make install
	@component build --dev
	@component build --standalone Joystick --name joystick --out demo
	
install:
	@component install --dev > /dev/null

demo:
	@google-chrome ./demo/demo.html
	
.PHONY: build install demo
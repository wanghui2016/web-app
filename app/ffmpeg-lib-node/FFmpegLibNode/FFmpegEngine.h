#ifndef FFMPEG_ENGINE
#define FFMPEG_ENGINE

#include <v8.h>
#include <vector>
#include <node_object_wrap.h>
#include <nan.h>
using namespace v8;
using namespace std;

#define DEFAULT_SAMPLE_RATE        (44100)
#define DEFAULT_SAMPLE_FORMAT      paFloat32
#define DEFAULT_FRAMES_PER_BUFFER  (256)
#define DEFAULT_NUM_BUFFERS        (8)

namespace SAASFFmpeg{
	class FFmpegEngine : public node::ObjectWrap{
	public:
		FFmpegEngine(Local<Object> options);
		~FFmpegEngine();
		static void Init(v8::Handle<v8::Object> target);
		static NAN_METHOD(NewInstance);
		static NAN_METHOD(pushAudioBuffer);
		static NAN_METHOD(startRecord);
	private:
		static NAN_METHOD(New);
		void wrapObject( v8::Handle<v8::Object> object );

		static v8::Persistent<v8::Function> constructor;
		int  m_uInputChannels;			//Number of input channels
		int  m_uSampleRate;				//默认44100
		int  m_uSampleFormat;			//index of the current sample format
	};
};
#endif
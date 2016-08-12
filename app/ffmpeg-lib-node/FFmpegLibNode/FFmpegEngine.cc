#include "FFmpegEngine.h"
#include "ffmpegnode.h"

#include <uv.h>
#include <node.h>
#include <stdlib.h>

using namespace std;
using namespace v8;
using namespace SAASFFmpeg;

Persistent<Function>  FFmpegEngine::constructor;

int ListenFFmpegCallBack(int ret, const char* event)
{
	return 1;
}

FFmpegEngine::FFmpegEngine(Local<Object> options)
{
	//初始化程序
	listen_callback callback = ListenFFmpegCallBack;
	ffmpeg_init(&callback);
}

void FFmpegEngine::NewInstance(const Nan::FunctionCallbackInfo<v8::Value>& info)
{
	Nan::HandleScope  scope;

	unsigned argc = info.Length();

	if(argc > 2)
	{
		argc = 2;
	}
	Handle<Value>* argv = new Handle<Value>[argc];

	argv[0] = info[0];
	if( argc > 1 )
	{
		argv[1] = info[1];
	}

	Local<Object> instance = Nan::New(constructor)->NewInstance(argc, argv);
	info.GetReturnValue().Set(instance);
}

void FFmpegEngine::pushAudioBuffer(const Nan::FunctionCallbackInfo<v8::Value>& info)
{
	Nan::HandleScope scope;
	if(info.Length() > 0)
	{

		//Local<Object>  leftAudiobuffer;
		//leftAudiobuffer = Local<Object>::Cast(info[0]);
		//char*   float32Buffer = node::Buffer::Data(leftAudiobuffer);
		//size_t  bufferLength  = node::Buffer::Length(leftAudiobuffer); info[0]
		size_t  bufferLength = 0;
		Local<v8::Float32Array> leftAudiobuffer = Local<v8::Float32Array>::Cast(info[0]);
		//Local<v8::Float32Array> leftAudiobuffer = info[0]->ToFloat32Array();
		if (leftAudiobuffer.IsEmpty())
		{
			info.GetReturnValue().Set(-1);
			/* code */
		}
		else
		{
			bufferLength = leftAudiobuffer->ByteLength()/4;
			//info.GetReturnValue().Set(0);
		}

		//Local<v8::Int16Array> int16Buffer = Local<v8::Int16Array>::Cast(Int16Array::New(leftAudiobuffer->Buffer(), 0 , bufferLength*2));

		//

		if (bufferLength > 0)
		{
			Local< ArrayBuffer > localArray = (leftAudiobuffer)->Buffer();
			float* float32Buffer = (float*)(localArray->Externalize().Data());
			short* int16Buffer = new short[bufferLength];

			for (size_t i = 0; i < bufferLength; ++i)
			{
				float temp = 0;
				memcpy(&temp, float32Buffer, 4);
				if (temp < 0) {
		            int16Buffer[i] = 0x8000 * temp;
		        } else {
		            int16Buffer[i] = 0x7FFF * temp;
		        }
				float32Buffer++;
			}
			// printf("ffmpeg, ssdddd, number is %d.， the element is %d.\n", bufferLength, int16Buffer[0]);

			ffmpeg_pushbuffer(int16Buffer, int16Buffer, bufferLength, 0);
			delete []int16Buffer;
		}
		// printf("ffmpeg, end \n");
	}
	else
	{
		info.GetReturnValue().Set(-1);
	}

}

void FFmpegEngine::startRecord(const Nan::FunctionCallbackInfo<v8::Value>& info)
{
	Nan::HandleScope scope;
	if (info.Length() > 0)
	{
		char url[] = "rtmp://publish.live.tinfinite.com/scope/146382560333762738";
		ffmpeg_start(url, strlen(url));
	}
	info.GetReturnValue().Set(0);
}

void FFmpegEngine::New(const Nan::FunctionCallbackInfo<v8::Value>& info)
{
	Nan::HandleScope scope;

	Local<Object> options;

	if( info.Length() > 0 )
	{
		if( !info[0]->IsObject() )
		{
            return Nan::ThrowTypeError("First argument must be an object.");
		}
		else
		{
			options = Local<Object>::Cast( info[0] );
		}
	}
	else
	{
		options = Nan::New<Object>();
	}

	FFmpegEngine* pEngine = new FFmpegEngine(options);
	pEngine->Wrap(info.This());
	info.GetReturnValue().Set( info.This() );
}

//把这个handle放入到对象中，对这个对象进行包装
void FFmpegEngine::wrapObject(v8::Handle<v8::Object> object)
{
	ObjectWrap::Wrap(object);
}

FFmpegEngine::~FFmpegEngine()
{
	ffmpeg_uninit();
}

/*Initialize our node object*/
NAN_MODULE_INIT(FFmpegEngine::Init)
{
	// Prepare constructor template
	Local<FunctionTemplate> functionTemplate = Nan::New<FunctionTemplate> (FFmpegEngine::New );
	functionTemplate->SetClassName(Nan::New<String>("FFmpegEngine").ToLocalChecked());
	functionTemplate->InstanceTemplate()->SetInternalFieldCount(1);

	//Nan::SetMethod(functionTemplate, "pushAudioBuffer", SAASFFmpeg::FFmpegEngine::pushAudioBuffer);
    //Nan::SetMethod(functionTemplate, "startRecord", SAASFFmpeg::FFmpegEngine::startRecord);
	constructor.Reset(Isolate::GetCurrent(), functionTemplate->GetFunction());
}

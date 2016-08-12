//
//  ffmpegios.h
//  ffmpegios
//
//  Created by guoxinchun on 16/6/27.
//  Copyright © 2016年 guoxinchun. All rights reserved.
//

#ifndef FFMPEGNODE_H_
#define FFMPEGNODE_H_

#ifdef __cplusplus
extern "C"{
#endif

/// \brief  初始化ffmpeg环境
/// \param  NULL
/// \return 小于0，出现错误.大于等于0，成功
typedef int (*listen_callback)(int ret, const char* event);
/// \brief  初始化ffmpeg环境
/// \param  NULL
/// \return 小于0，出现错误.大于等于0，成功
int ffmpeg_init(listen_callback* callback);

/// \brief  析构ffmpeg环境
/// \param  NULL
/// \return 小于0，出现错误.大于等于0，成功
int ffmpeg_uninit();

/// \brief  直接传输PCM数据，对数据buffer进行编码，现在立体声都是在一个buffer中传输过来
/// \brief  现在支持bufferleft，bufferright暂时为null，samples为取样的大小，buffer的大小
/// \param  bufferLeft   左声道buffer
/// \param  bufferRight  右声道buffer
/// \param  samples   	 取样大小，buffer的大小
/// \return 小于0，出现错误.大于等于0，成功
int ffmpeg_pushbuffer(short* bufferLeft, short* bufferRight, int samples,
                                             int boptimize);
/// \brief  开始录音
/// \param  outputUrl: 直播的地址,或者文件存储的地址。监听可能发生的错误

int ffmpeg_start(const char* outputurl, int len);
/// \brief  结束录音
/// \param  NULL
/// \return 小于0，出现错误.大于等于0，成功
int ffmpeg_end();

/// \brief 传输文件，把音频文件传输到服务器进行直播，支持解码为mp3，aac，默认录制的flv格式的文件
/// \file  当前文件地址，
/// \outputurl 传输的文件地址
/// \return 小于0，出现错误.大于等于0，成功
int ffmpeg_transferfile(const char* file, const char* outputurl);
#ifdef __cplusplus
}

#endif
/// \brief
#endif
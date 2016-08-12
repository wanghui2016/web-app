{
	'targets': [
		{
			'target_name': 'FFmpegLibNode',
			'sources':[
                'FFmpegLibNode/FFmpegLibNode.cc',
                'FFmpegLibNode/FFmpegEngine.cc'
			],
			'include_dirs':[
				'<(module_root_dir)/include/',
                '<(module_root_dir)/FFmpegLibNode/',
				"<!(node -e \"require('nan')\")"
			],
			"conditions":[
				[
					'OS=="linux"',{
						"libraries":{

						}
					}
				],
				[
					'OS=="mac"',{
						"libraries":[
							'<(module_root_dir)/lib/libffmpegmac.a',
                            '/Library/Frameworks/VideoDecodeAcceleration.framework',
                            '/Library/Frameworks/CoreVideo.framework',
                            '/Library/Frameworks/CoreFoundation.framework'
						],
                        'cflags!': [ '-fno-exceptions' ],
                        'cflags_cc!': [ '-fno-exceptions' ],
                        'cflags_cc': [ '-std=c++0x' ]
					}
				]
			]
		}
	]
}
seajs.config({
    // 映射,添加版本号
    map: [
         [ /^(.*\.(?:css|js))$/i, '$1?v=' + new Date().getTime() ]
    ],
    // 别名配置
    alias: {
        'util': 'lib/util/main',    // 工具方法
        'json': 'lib/json/json2',    // json
        'mustache':'lib/mustache/mustache.js',
        'preview':'lib/preview/js/preview.js'
    },
    // 文件编码
    charset: 'utf-8'
});

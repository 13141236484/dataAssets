/**
 * Created by gaoyu at 2018/7/25 下午2:53
 *
 * Desc :
 */
const Joi = require('joi');
// 出错返回
let validate = function (input, schema) {
	let result = Joi.validate(input, schema);
	if (result.error) {
		throw result.error;
	}
};
// 验证uuid->参数验证(删除共用)
let commonParametersUuid = Joi.object().keys({
	uuid: Joi.required()
});
// 验证uuid->参数验证(共用)
let commonParameters = Joi.object().keys({
	uuid: Joi.string().required()
});
// 验证id->参数验证(共用)
let commonId = Joi.object().keys({
	id: Joi.number().positive().integer().required()
});

// 添加区域->参数验证
let regionCreate = Joi.object().keys({
	uuid: Joi.string().required(),
	regional_name: Joi.string().required(),
	creation_time: Joi.number().positive().integer().required(),
	user_id: Joi.number().positive().integer().required(),
	region_remarks: Joi.string().allow(''),
	region_status: Joi.number().positive().integer().required()
});
// 修改区域->参数验证
let regionUpdate = Joi.object().keys({
	uuid: Joi.string().required(),
	regional_name: Joi.string().required(),
	creation_time: Joi.number().positive().integer().required(),
	region_remarks: Joi.string().allow(''),
	region_status: Joi.number().positive().integer().required()
});
// 删除区域->参数验证(暂未使用)
let regionDelete = Joi.object().keys({
	uuid: Joi.string().required()
});

// 添加路径->参数验证
let pathCreate = Joi.object().keys({
	uuid: Joi.string().required(),
	detailed_path: Joi.string().required(),
	creation_time: Joi.number().positive().integer().required(),
	user_id: Joi.number().positive().integer().required(),
	path_remarks: Joi.string().allow(''),
	medium_id: Joi.string().required()
});
// 修改路径->参数验证
let pathUpdate = Joi.object().keys({
	uuid: Joi.string().required(),
	detailed_path: Joi.string().required(),
	creation_time: Joi.number().positive().integer().required(),
	path_remarks: Joi.string().allow(''),
	medium_id: Joi.string().required()
});

// 添加介质->参数验证
let mediumCreate = Joi.object().keys({
	uuid: Joi.string().required(),
	medium_name: Joi.string().required(),
	region_id: Joi.string().required(),
	medium_type_name: Joi.string().required(),
	medium_example: Joi.string().required(),
	creation_time: Joi.number().positive().integer().required(),
	user_id: Joi.number().positive().integer().required(),
	medium_remarks: Joi.string().allow('')
});
// 修改介质->参数验证
let mediumUpdate = Joi.object().keys({
	uuid: Joi.string().required(),
	medium_name: Joi.string().required(),
	region_id: Joi.string().required(),
	medium_type_name: Joi.string().required(),
	medium_example: Joi.string().required(),
	creation_time: Joi.number().positive().integer().required(),
	medium_remarks: Joi.string().allow('')
});

// 添加资产->参数验证
let assetsCreate = Joi.object().keys({
	uuid: Joi.string().required(),
	asset_name: Joi.string().required(),
	region_id: Joi.string().required(),
	path_id: Joi.string().required(),
	medium_id: Joi.string().required(),
	is_cycle: Joi.number().positive().integer().required(),
	start_cycle_time: Joi.number().integer().required().allow(0),
	end_cycle_time: Joi.number().integer().required().allow(0),
	enclosure_path: Joi.string().required().allow(''),
	// sheif_status: Joi.number().positive().integer().required(),
	put_status: Joi.string().required(),
	creation_time: Joi.number().positive().integer().required(),
	user_id: Joi.number().positive().integer().required(),
	asset_remarks: Joi.string().allow(''),
	ifstructure: Joi.string().required(),
	structure_type_name: Joi.string().allow('')
});
// 修改资产->参数验证
let assetsUpdate = Joi.object().keys({
	uuid: Joi.string().required(),
	asset_name: Joi.string().required(),
	region_id: Joi.string().required(),
	path_id: Joi.string().required(),
	medium_id: Joi.string().required(),
	is_cycle: Joi.number().positive().integer().required(),
	start_cycle_time: Joi.number().integer().required().allow(0),
	end_cycle_time: Joi.number().integer().required().allow(0),
	enclosure_path: Joi.string().required().allow(''),
	// sheif_status: Joi.number().positive().integer().required(),
	put_status: Joi.string().required(),
	creation_time: Joi.number().positive().integer().required(),
	asset_remarks: Joi.string().allow(''),
	ifstructure: Joi.string().required(),
	structure_type_name: Joi.string().allow('')
});
// 上架下架切换->参数验证
let assetsSheif = Joi.object().keys({
	uuid: Joi.string().required(),
	is_cycle: Joi.number().positive().integer().required(),
	status: Joi.number().positive().integer().required()
});

// 添加生产线->参数验证
let beltlineCreate = Joi.object().keys({
	uuid: Joi.string().required(),
	beltline_name: Joi.string().required(),
	creation_time: Joi.number().positive().integer().required(),
	user_id: Joi.number().positive().integer().required(),
	beltline_remarks: Joi.string().allow('')
});
// 修改生产线->参数验证
let beltlineUpdate = Joi.object().keys({
	uuid: Joi.string().required(),
	beltline_name: Joi.string().required(),
	creation_time: Joi.number().positive().integer().required(),
	beltline_remarks: Joi.string().allow('')
});
// 生产线关联生产工艺->参数验证
let beltlineAssociationProcess = Joi.object().keys({
	beltline_id: Joi.number().positive().integer().required(),
	batch_id: Joi.required()
});

// 添加生产过程->参数验证
let productionProcessCreate = Joi.object().keys({
	uuid: Joi.string().required(),
	process_name: Joi.string().required(),
	creation_time: Joi.number().positive().integer().required(),
	user_id: Joi.number().positive().integer().required(),
	process_remarks: Joi.string().allow(''),
	batch_id: Joi.string().required(),
	start_state: Joi.number().positive().integer().required()
});
// 修改生产过程->参数验证
let productionProcessUpdate = Joi.object().keys({
	uuid: Joi.string().required(),
	process_name: Joi.string().required(),
	creation_time: Joi.number().positive().integer().required(),
	process_remarks: Joi.string().allow(''),
	batch_id: Joi.string().required(),
	start_state: Joi.number().positive().integer().required()
});
// 生产过程关联资产->参数验证
let processAssetRelations = Joi.object().keys({
	asset_relation_data: Joi.required()
});
// 依赖->过程数据列表->参数验证
let relyOnProcessList = Joi.object().keys({
	technology_id: Joi.string().required(),
	process_id: Joi.string().required()
});
// 依赖->查看依赖关系表中是否存在->参数验证
let dependenceExist = Joi.object().keys({
	son_process_id: Joi.string().required(),
	par_process_id: Joi.string().required()
});
// 依赖->依赖关系表入库->参数验证
let processDependenceCreate = Joi.object().keys({
	son_process_id: Joi.string().required(),
	par_process_id: Joi.required()
});
// 生产过程关联资产(删除)->参数验证
let processAssetRelationsDelete = Joi.object().keys({
	process_id: Joi.string().required(),
	asset_id: Joi.string().required(),
	put_status: Joi.string().required(),
});

// 添加生产工艺->参数验证
let productionEngineeringCreate = Joi.object().keys({
	uuid: Joi.string().required(),
	batch_name: Joi.string().required(),
	creation_time: Joi.number().positive().integer().required(),
	user_id: Joi.number().positive().integer().required(),
	batch_remarks: Joi.string().allow(''),
	beltline_id: Joi.string().required()
});
// 修改生产工艺->参数验证
let productionEngineeringUpdate = Joi.object().keys({
	uuid: Joi.string().required(),
	batch_name: Joi.string().required(),
	creation_time: Joi.number().positive().integer().required(),
	batch_remarks: Joi.string().allow(''),
	beltline_id: Joi.string().required()
});
// 生产工艺关联生产过程->参数验证
let technologyProcessRelation = Joi.object().keys({
	technology_id: Joi.number().positive().integer().required(),
	process_id: Joi.required()
});

// 资产（写入内容txt）->参数验证
let writeFileTxtContent = Joi.object().keys({
	content: Joi.string().required(),
	txt_path: Joi.string().required()
});

module.exports = {
	// 必调用方法
	validate: validate,
	// 验证uuid->参数验证(删除共用)
	commonParametersUuid: commonParametersUuid,
	// 验证uuid->参数验证(共用)
	commonParameters: commonParameters,
	// 验证id->参数验证(共用)
	commonId: commonId,

	// 添加区域->参数验证
	regionCreate: regionCreate,
	// 修改区域->参数验证
	regionUpdate: regionUpdate,
	// 删除区域->参数验证
	regionDelete: regionDelete,

	// 添加路径->参数验证
	pathCreate: pathCreate,
	// 修改路径->参数验证
	pathUpdate: pathUpdate,

	// 添加介质->参数验证
	mediumCreate: mediumCreate,
	// 修改介质->参数验证
	mediumUpdate: mediumUpdate,

	// 添加资产->参数验证
	assetsCreate: assetsCreate,
	// 修改资产->参数验证
	assetsUpdate: assetsUpdate,
	// 上架下架切换->参数验证
	assetsSheif: assetsSheif,

	// 添加生产线->参数验证
	beltlineCreate: beltlineCreate,
	// 修改生产线->参数验证
	beltlineUpdate: beltlineUpdate,
	// 生产线关联生产工艺->参数验证
	beltlineAssociationProcess: beltlineAssociationProcess,
	// 依赖->依赖关系表入库->参数验证
	processDependenceCreate: processDependenceCreate,

	// 添加生产过程->参数验证
	productionProcessCreate: productionProcessCreate,
	// 修改生产过程->参数验证
	productionProcessUpdate: productionProcessUpdate,
	// 生产过程关联资产->参数验证
    processAssetRelations: processAssetRelations,
    // 依赖->过程数据列表->参数验证
    relyOnProcessList: relyOnProcessList,
    // 依赖->查看依赖关系表中是否存在->参数验证
    dependenceExist: dependenceExist,
    // 生产过程关联资产(删除)->参数验证
	processAssetRelationsDelete: processAssetRelationsDelete, 

	// 添加生产工艺->参数验证
	productionEngineeringCreate: productionEngineeringCreate,
	// 修改生产工艺->参数验证
	productionEngineeringUpdate: productionEngineeringUpdate,
	// 生产工艺关联生产过程->参数验证
	technologyProcessRelation: technologyProcessRelation,

	// 资产（写入内容txt）->参数验证
	writeFileTxtContent: writeFileTxtContent,
}
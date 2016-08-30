use 7masters;

db.createCollection("client");

// Documento simples
db.client.
	insert({name: "David Paniz (aninhado)", 
			enabled: true});
db.client.find({enabled: true /*também pode complicar aqui*/}).map(function(cli) {return cli.name} )

db.client.remove({})
// Documento com documento aninhado
db.client.
	insert({name: "David Paniz (aninhado)", 
			enabled: true,
			projects: [{_id: new ObjectId(),
						name: "7master - MongoDB"}]});

db.client.
	find({enabled: true /* ... */}).
	map(function(cli) {
		return cli.projects.map( function(project) { 
				return [cli.name, project.name]
				}
			)
		}
	)
		
db.client.remove({})
// Filtrando documentod com documentod aninhados
db.client.
	insert({name: "David Paniz", 
			enabled: true,
			projects: [{_id: new ObjectId(),
						name: "7master - MongoDB",
						enabled: false}]});
db.client.
	insert({name: "Outro Cli", 
			enabled: true,
			projects: [{_id: new ObjectId(),
						name: "7master - MongoDB",
						enabled: false},
						{_id: new ObjectId(),
						name: "Outro projeto",
						enabled: true}]});

db.client.
	find({enabled: true,
		  projects: {"$elemMatch": {enabled: true}}}).
	map(function(cli) {
		return cli.projects.map(function(project) { 
				return [cli.name, project.name, project.enabled, project._id]
				}
			)	
		}
	)

db.client.
	find({enabled: true,
		  "projects.enabled": true}).
	map(function(cli) {
		return cli.projects.map(function(project) { 
				return [cli.name, project.name, project.enabled, project._id]
				}
			)	
		}
	)

var cursor = db.client. find({enabled: true});
cursor.next();
var outroCli = cursor.next();
var projectId = outroCli.projects[1]._id;

db.client.
	update({enabled: true,
		    "projects._id": projectId},
		    {$set: {"projects.$.enabled": false}})
		
db.find({})


db.client.remove({})
// Documentos com referencia para outros documentos
db.createCollection("user");
db.user.remove({})

db.user.insert({name: "Fulano Capataz"});

var capatazId = db.user.find({}).next()._id;
db.client.insert({name: "David Paniz",
				  enabled: true,
				  projectManager: capatazId})


db.client.find({projectManager: capatazId})

db.client.
	find({}).
	map(function(cli) {
		return [cli.name, db.user.findOne({_id: cli.projectManager}).name]
	})
	

db.client.
	aggregate([
		{
			$lookup: {
				from: "user",
				localField: "projectManager",
				foreignField: "_id",
				as: "manager"

			}
		}
	]).
	map(function(cli) {
		return [cli.name, cli.manager[0].name]
	})
	

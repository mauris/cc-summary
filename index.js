var fs = require("fs");
var parse = require('csv-parse');
var Promise = require('bluebird');

var readAndParse = function (file) {
  return new Promise(function(resolve, reject){
    fs.readFile(file, function(err, data){
      parse(data, function(err, result){
        resolve(result);
      });
    })
  });
};

var students = {};
var summary = [];

var printSummary = function() {
  Object.keys(students)
    .forEach(function(studentId){
      students[studentId].completed.sort().reverse();
      console.log("Name:\t" + students[studentId].name);
      if (students[studentId].completed.length == 0) {
        console.log('\tNo attempt');
      } else {
        console.log("\t" + students[studentId].completed[0]);
      }
      console.log('---')
    });
};

var processReportFile = function(file) {
  return new Promise(function(resolve, reject){
    readAndParse(file)
      .then(function(list) {
        list.forEach(function(student){
          if (students[student[1]] && student[5] == 'A') {
            students[student[1]].completed.push(file);
          }
        });
        resolve();
      });
  });
}

var processReportsInDirectory = function(dir) {
    fs.readdir(dir, function(err, files){
      var promises = [];
      files.forEach(function(file) {
        if (file !== "students.csv" && file.endsWith(".csv")) {
          promises.push(processReportFile(file));
        }
      });
      Promise.all(promises)
        .then(printSummary);
    });
}

readAndParse('students.csv')
  .then(function(nr){
    nr.forEach(function(student) {
      students[student[0]] = {
        "name": student[1].trim(),
        "completed": []
      };
    });

    console.log('---')
    processReportsInDirectory(".");
  });

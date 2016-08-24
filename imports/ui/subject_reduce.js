import "./subject_reduce.html"
import {Subjects} from "../api/module_tables.js"


var top_row_metrics = ["AgeOfOnset", "CurrentAge", "DiseaseCourse", "EDSS", "Sex", "MSSS"]
var side_data_config = [{"entry_type":"mindboggle", "metric": "Right-Caudate_volume"},
                {"entry_type":"freesurfer", "metric": "TotalGrayVol"},
                {"entry_type": "antsCT", "metric": "WM"}]

var get_data = function(entry_type, metric, mse_order){

    var output = []
    mse_order.forEach(function(val, idx, arr){
        Meteor.subscribe("mse_info", val, entry_type, metric)
        var filter = {"subject_id": val,
                       "entry_type": entry_type}
        filter["metrics."+metric] = {"$ne": null}

        var arr = Subjects.find(filter).fetch()
        //console.log("arr is", arr)
        if (arr.length){
            arr.forEach(function(val2, idx2, arr2){
                tmp = {}
                tmp["x"] = idx
                tmp["y"] = val2.metrics[metric]
                output.push(tmp)
            })

        }
    })
    //console.log("output of get_data is", output)
    return output
}

Template.subject.helpers({

top_row: function(){

    var msid = Session.get("currentMSID")
    var arr = Subjects.find({"msid": msid,
                             "entry_type": "demographic",
                             "metrics.AgeOfOnset": {"$ne": null}},
                             {sort: {"metrics.DCM_StudyDate": 1}}).fetch()
    //console.log("arr is", arr)
    if (arr.length){
        var N = arr.length - 1

        var metrics = arr[N].metrics
        console.log("metrics", metrics)
        output = []
        top_row_metrics.forEach(function(val, idx, arr){
            var tmp = {}
            tmp["name"] = val
            //console.log("val is", val, metrics[val])
            tmp["value"] = metrics[val]
            tmp["date"] = metrics.DCM_StudyDate
            output.push(tmp)
        })
        //console.log("output is", output)
        return output
    }
    return []
},

side_data: function(){

    var output = []
    var msid = Session.get("currentMSID")
    var arr = Subjects.find({"msid": msid,
                             "entry_type": "demographic",
                             },
                             {sort: {"metrics.DCM_StudyDate": 1}}).fetch()

    var mse_order = []
    if (arr.length){
        arr.forEach(function(val, idx, arr){
            mse_order.push(val.subject_id)
        })
    }
    side_data_config.forEach(function(val, idx, arr){
        var tmp = {}
        tmp["type"] = val.entry_type
        tmp["metric"] = val.metric
        tmp["data"] = get_data(val.entry_type, val.metric, mse_order)
        //console.log("tmp data is", tmp)
        output.push(tmp)
    })
    //console.log("output for side data is", output)
    return output

}

})

var doPlot = function(metric, type, data){

    _.defer(function () {
                //data.forEach(function(val, idx,arr){
                nv.addGraph(function() {
                    var chart = nv.models.lineChart()
                    //console.log("chart is", chart)
                    chart.margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
                    chart.useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
                    //chart.transitionDuration(350)  //how fast do you want the lines to transition?
                    chart.showLegend(true)       //Show the legend, allowing users to turn on/off line series.
                    chart.showYAxis(true)        //Show the y-axis
                    chart.showXAxis(true)        //Show the x-axis
                    ;

                    chart.xAxis     //Chart x-axis settings
                      .axisLabel('Timepoint')
                      .tickFormat(d3.format(',r'));

                    chart.yAxis     //Chart y-axis settings
                      .tickFormat(d3.format('.02f'));

                    /* Done setting the chart up? Time to render it!*/
                    //var myData = sinAndCos();   //You need data...

                     var myData = [{"values": data, "key": metric, "color": "#ff7f0e"}]
                     console.log("myData is", myData)
                     console.log("d3 stuff", d3.select('#chart_'+type+" svg"))
                     d3.select('#chart_'+type+" svg")    //Select the <svg> element you want to render the chart in.
                      .datum(myData)         //Populate the <svg> element with chart data...
                      .call(chart);          //Finally, render the chart!
                     console.log("d3 stuff 2", d3.select('#chart_'+type+" svg"))
                  //Update the chart when window resizes.
                  nv.utils.windowResize(function() { chart.update() });
                  console.log("chart is", chart)
                  return chart;
                }); //end addGraph
                //}); //end foreach in data
    }); //end defer

}

Template.sidebardiv_content.helpers({

    plot: function(data){
        var metric = this.metric
        var type=this.type
        if (data.length){
            //console.log("this is", this, "data is", data, "nv", nv.models.lineChart)
            doPlot(metric, type, data)
        }//end if
    }
})

Template.sidebardiv_content.rendered = function(){

    //console.log(this, "is rendered")
    if(!this._rendered) {
      this._rendered = true;
      console.log('Template onLoad');
    }
    this.autorun(function(){
         var msid = Session.get("currentMSID")
         console.log("HELLO")
    })

}

Template.subject.events({
})

Template.subject.rendered = function(){

 if(!this._rendered) {
      this._rendered = true;
      //console.log('Template onLoad');
    }
    this.autorun(function(){
        var msid = Session.get("currentMSID")
        console.log("currentMSID is", msid)
        Meteor.subscribe("msid_info", msid)
        var arr = Subjects.find({"msid": msid,
                                 "entry_type": "demographic"},
                                {sort: {"metrics.DCM_StudyDate": 1}}).fetch()
        //console.log(arr)
    })

}
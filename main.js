let API_KEY = "YOUR_IONOS_API_KEY" 



class IonosAPI{
    API_KEY="";
    zones = "";
    sous_domains=[];
    constructor(API_KEY, zones, sous_domains){
        this.API_KEY = API_KEY;
        this.zones = zones;
        this.sous_domains.push(zones)
        for(const [id, sous_domain] of Object.entries(sous_domains))
            this.sous_domains.push(sous_domain+"."+ this.zones)
        
    }

    async enableDynDns(){

    }

    async fetchMyIp(){
        let answer = await fetch(`https://api.ipify.org/`, {
            method: "GET",
            headers: this.getHeaders()
        });
        return await answer.text();
    }

    getHeaders(){
        return {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-API-Key": this.API_KEY
        }
    }

    async fetchZoneId(){
        let answer = await fetch(`https://api.hosting.ionos.com/dns/v1/zones/`, {
            method: "GET",
            headers: this.getHeaders()
        });
        let zones  = await answer.json();
        for(const zone of zones)
            if(zone.name == this.zones)
                return zone.id;
            
        
        return -1;

    }

    async fetchRecords(){
        let zones_id = await this.fetchZoneId();
        if(zones_id == -1)
            return console.log("Zone not found");
        console.log("fetch records for url "+ this.zones+" with id "+zones_id);
        let answer = await fetch(`https://api.hosting.ionos.com/dns/v1/zones/${zones_id}?recordType=A`, {
            method: "GET",
            headers: this.getHeaders()
        });
        let records  = await answer.json();
        let recordsParsed = {};
        for(const record of records.records)
            if(this.sous_domains.includes(record.name))
                recordsParsed[record.name] = record.id;
            else
                console.log(record)
            
        
        return [zones_id, recordsParsed];
    }

    async updateAll(){
        let my_ip= await this.fetchMyIp();
        let [zones_id, records] = await this.fetchRecords();
        console.log(records);
        for(const [url, record] of Object.entries(records)){
            console.log("updating "+url + " with "+ my_ip);
            let answer = await fetch(`https://api.hosting.ionos.com/dns/v1/zones/${zones_id}/records/${record}?recordType=A`, {
                method: "PUT",
                headers: this.getHeaders(),
                body: JSON.stringify({
                    "disabled": false,
                    "content": my_ip,
                    "ttl": 60,
                    "prio": 0
                })
            });
            console.log(answer.status);
        }
    }


}

let apis  =[ 
    new IonosAPI(API_KEY, "my_domain.name", [
        "subdomaine", // you subdomaine name 
        "sub.subdomain"// you sub subdomaine name
    ]),
].map(el=>el.updateAll());

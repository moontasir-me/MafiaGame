package com.shoyaeb.mafia;

import android.content.res.AssetManager;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;

/** A foreground LAN transport. Game authority stays in the original secure WebView. */
final class LocalRoomServer implements AutoCloseable {
    interface Dispatcher { String dispatch(String path, String body) throws Exception; }
    private final AssetManager assets;
    private final Dispatcher dispatcher;
    private final ServerSocket socket;
    private final ExecutorService workers = Executors.newFixedThreadPool(8);
    private volatile boolean running = true;
    LocalRoomServer(AssetManager assets, Dispatcher dispatcher) throws IOException {
        this.assets = assets; this.dispatcher = dispatcher;
        socket = new ServerSocket(); socket.setReuseAddress(true);
        socket.bind(new InetSocketAddress("0.0.0.0", 5173), 24);
        Thread acceptor = new Thread(() -> {
            while (running) try {
                Socket client = socket.accept();
                workers.execute(() -> serve(client));
            } catch (IOException | RejectedExecutionException ignored) { }
        }, "mafia-lan");
        acceptor.setDaemon(true); acceptor.start();
    }
    static String network() {
        JSONArray addresses = new JSONArray();
        try {
            ArrayList<String> ips = new ArrayList<>();
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface iface = interfaces.nextElement();
                if (!iface.isUp() || iface.isLoopback()) continue;
                Enumeration<InetAddress> addrs = iface.getInetAddresses();
                while (addrs.hasMoreElements()) {
                    InetAddress a = addrs.nextElement();
                    if (a instanceof Inet4Address && a.isSiteLocalAddress()) ips.add(a.getHostAddress());
                }
            }
            Collections.sort(ips);
            for (String ip : ips) addresses.put("http://" + ip + ":5173");
            return new JSONObject().put("addresses", addresses).toString();
        } catch (Exception e) { return "{\"addresses\":[]}"; }
    }
    private static String line(InputStream in) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        int c;
        while ((c = in.read()) != -1 && c != '\n') {
            if (out.size() >= 8192) throw new IOException("Header too large");
            if (c != '\r') out.write(c);
        }
        return out.toString("UTF-8");
    }
    private void serve(Socket client) {
        try (Socket s = client) {
            s.setSoTimeout(8000);
            InputStream in = new BufferedInputStream(s.getInputStream());
            OutputStream out = s.getOutputStream();
            String[] request = line(in).split(" ");
            if (request.length != 3) return;
            HashMap<String,String> headers = new HashMap<>();
            for (int count = 0; count < 40; count++) {
                String l = line(in); if (l.isEmpty()) break;
                int sep = l.indexOf(':');
                if (sep > 0) headers.put(l.substring(0,sep).toLowerCase(Locale.ROOT), l.substring(sep+1).trim());
                if (count == 39) throw new IOException("Headers");
            }
            String path = new URI(request[1]).getPath();
            if (path.startsWith("/api/")) {
                String origin = headers.get("origin");
                if (origin != null && !origin.equals("http://" + headers.get("host"))) { reply(out,403,"application/json","{\"error\":\"ORIGIN\"}".getBytes(StandardCharsets.UTF_8)); return; }
                if (path.equals("/api/network") && request[0].equals("GET")) { reply(out,200,"application/json",network().getBytes(StandardCharsets.UTF_8)); return; }
                if (!request[0].equals("POST") || !headers.getOrDefault("content-type","").startsWith("application/json")) { reply(out,405,"application/json","{\"error\":\"METHOD\"}".getBytes(StandardCharsets.UTF_8)); return; }
                int length = Integer.parseInt(headers.getOrDefault("content-length","0"));
                if (length < 1 || length > 16384) { reply(out,413,"application/json","{\"error\":\"SIZE\"}".getBytes(StandardCharsets.UTF_8)); return; }
                byte[] body = new byte[length]; int read = 0;
                while (read < length) { int n = in.read(body,read,length-read); if (n < 0) throw new EOFException(); read += n; }
                JSONObject result = new JSONObject(dispatcher.dispatch(path,new String(body,StandardCharsets.UTF_8)));
                boolean ok = result.optBoolean("ok");
                String response = ok ? result.get("data").toString() : new JSONObject().put("error",result.optString("error","CONNECTION")).toString();
                reply(out,ok?200:400,"application/json",response.getBytes(StandardCharsets.UTF_8));return;
            }
            if (!request[0].equals("GET") || path.contains("..") || path.contains("\\")) { reply(out,403,"text/plain",new byte[0]); return; }
            String asset = path.equals("/") ? "index.html" : path.substring(1);
            try (InputStream file = assets.open(asset)) {
                ByteArrayOutputStream bytes = new ByteArrayOutputStream(); byte[] buffer = new byte[8192]; int n;
                while ((n = file.read(buffer)) != -1) bytes.write(buffer,0,n);
                String mime = asset.endsWith(".html")?"text/html; charset=utf-8":asset.endsWith(".css")?"text/css":asset.endsWith(".js")||asset.endsWith(".mjs")?"text/javascript":asset.endsWith(".png")?"image/png":asset.endsWith(".svg")?"image/svg+xml":"application/json";
                reply(out,200,mime,bytes.toByteArray());
            } catch (IOException e) { reply(out,404,"text/plain",new byte[0]); }
        } catch (Exception ignored) { }
    }
    private static void reply(OutputStream out,int status,String type,byte[] data) throws IOException {
        String head = "HTTP/1.1 " + status + " Response\r\nContent-Type: " + type + "\r\nContent-Length: " + data.length + "\r\nCache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\nConnection: close\r\n\r\n";
        out.write(head.getBytes(StandardCharsets.UTF_8));out.write(data);out.flush();
    }
    @Override public void close() { running=false;try { socket.close(); } catch(IOException ignored) { } workers.shutdownNow(); }
}
